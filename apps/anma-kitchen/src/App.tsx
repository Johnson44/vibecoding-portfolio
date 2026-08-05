import { useEffect, useMemo, useState, type FormEvent } from "react";
import { menuCategories, menuItems, type MenuCategory, type MenuItem } from "./menuData";
import { requestKitchen } from "./kitchenApi";

type Role = "customer" | "mom" | "menu";
type OrderStatus = "new" | "cooking" | "ready" | "done";
type OrderItem = MenuItem & { quantity: number };

type Order = {
  id: string;
  customer: string;
  note: string;
  items: OrderItem[];
  status?: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "anma-kitchen-orders";
const MENU_STORAGE_KEY = "anma-kitchen-menu";
const CHANNEL_NAME = "anma-kitchen-sync";
const KITCHEN_CODES = ["1", "2"] as const;

function normalizeRoomCode(value: string) {
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return normalized === "1" || normalized === "2" ? normalized : "";
}

function readLocalOrders(roomId: string): Order[] {
  try {
    const saved = window.localStorage.getItem(`${STORAGE_KEY}:${roomId}`);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function createOrderId() {
  return `AK-${Date.now().toString(36).slice(-5).toUpperCase()}`;
}

function createDefaultMenu() {
  return menuItems.map((item) => ({ ...item, enabled: true }));
}

function getInitialRoomState(): { roomId: string; role: Role } {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const hashRole = params.get("role");
  return {
    roomId: normalizeRoomCode(params.get("room") ?? ""),
    role: hashRole === "mom" || hashRole === "menu" ? hashRole : "customer",
  };
}

function roomHash(roomId: string, role: Role) {
  return `room=${encodeURIComponent(roomId)}&role=${role}`;
}

function App() {
  const initialRoomState = getInitialRoomState();
  const [role, setRole] = useState<Role>(initialRoomState.role);
  const [roomId, setRoomId] = useState(initialRoomState.roomId);
  const [category, setCategory] = useState<MenuCategory>("荤菜");
  const [search, setSearch] = useState("");
  const [kitchenMenu, setKitchenMenu] = useState<MenuItem[]>(createDefaultMenu);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState("我");
  const [note, setNote] = useState("");
  const [orders, setOrders] = useState<Order[]>(() => initialRoomState.roomId ? readLocalOrders(initialRoomState.roomId) : []);
  const [lastOrderId, setLastOrderId] = useState("");
  const [syncMode, setSyncMode] = useState<"cloud" | "local">("cloud");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const handleHashChange = () => {
      const next = getInitialRoomState();
      setRole(next.role);
      setRoomId(next.roomId);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!roomId) {
      setOrders([]);
      return;
    }

    let cancelled = false;
    const localKey = `${STORAGE_KEY}:${roomId}`;
    const applyLocalOrders = (nextOrders: Order[]) => {
      if (cancelled) return;
      setOrders(nextOrders);
      window.localStorage.setItem(localKey, JSON.stringify(nextOrders));
    };
    const syncOrders = async () => {
      try {
        const payload = await requestKitchen<{ orders?: Order[] }>({ roomId, resource: "orders", method: "GET" });
        if (Array.isArray(payload.orders)) {
          applyLocalOrders(payload.orders);
          setSyncMode("cloud");
        }
      } catch {
        setSyncMode("local");
        applyLocalOrders(readLocalOrders(roomId));
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== localKey || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as Order[];
        if (Array.isArray(parsed)) applyLocalOrders(parsed);
      } catch {
        // Ignore malformed updates from another tab.
      }
    };

    void syncOrders();
    const timer = window.setInterval(() => void syncOrders(), 1500);
    window.addEventListener("storage", handleStorage);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("storage", handleStorage);
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;
    const localKey = `${MENU_STORAGE_KEY}:${roomId}`;
    const syncMenu = async () => {
      try {
        const payload = await requestKitchen<{ menu?: MenuItem[] | null }>({ roomId, resource: "menu", method: "GET" });
        if (cancelled) return;
        const nextMenu = Array.isArray(payload.menu) ? payload.menu : createDefaultMenu();
        setKitchenMenu(nextMenu);
        window.localStorage.setItem(localKey, JSON.stringify(nextMenu));
      } catch {
        try {
          const saved = window.localStorage.getItem(localKey);
          if (!cancelled && saved) setKitchenMenu(JSON.parse(saved) as MenuItem[]);
        } catch {
          // Keep the built-in menu when the menu service is unavailable.
        }
      }
    };

    void syncMenu();
    const timer = window.setInterval(() => void syncMenu(), 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [roomId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedItems = useMemo(
    () => kitchenMenu
      .filter((item) => item.enabled !== false && (cart[item.id] ?? 0) > 0)
      .map((item) => ({ ...item, quantity: cart[item.id] })),
    [cart, kitchenMenu],
  );
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return kitchenMenu.filter((item) => item.enabled !== false && item.category === category && (!keyword || item.name.toLowerCase().includes(keyword)));
  }, [category, kitchenMenu, search]);
  const todayOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === new Date().toDateString());

  const showToast = (message: string) => setToast(message);

  const applyOrders = (nextOrders: Order[]) => {
    setOrders(nextOrders);
    if (roomId) window.localStorage.setItem(`${STORAGE_KEY}:${roomId}`, JSON.stringify(nextOrders));
    if ("BroadcastChannel" in window && roomId) {
      const channel = new BroadcastChannel(`${CHANNEL_NAME}:${roomId}`);
      channel.postMessage(nextOrders);
      channel.close();
    }
  };

  const requestRemoteOrders = async (method: "POST" | "DELETE", order?: Order, orderId?: string) => {
    if (!roomId) throw new Error("missing room");
    const payload = await requestKitchen<{ orders?: Order[] }>({ roomId, resource: "orders", method, id: orderId, body: order });
    if (!Array.isArray(payload.orders)) throw new Error("invalid orders");
    setSyncMode("cloud");
    return payload.orders;
  };

  const saveKitchenMenu = async (nextMenu: MenuItem[]) => {
    const cleanedMenu = nextMenu
      .map((item) => ({ ...item, name: item.name.trim() }))
      .filter((item) => item.name);
    setKitchenMenu(cleanedMenu);
    if (roomId) window.localStorage.setItem(`${MENU_STORAGE_KEY}:${roomId}`, JSON.stringify(cleanedMenu));
    try {
      await requestKitchen({ roomId, resource: "menu", method: "PUT", body: cleanedMenu });
      setSyncMode("cloud");
      showToast("这家厨房的菜单已经更新");
    } catch {
      setSyncMode("local");
      showToast("菜单已保存在本机，云端恢复后可再次保存");
    }
  };

  const enterRoom = (value: string, nextRole: Role = "customer") => {
    const nextRoom = normalizeRoomCode(value);
    if (!nextRoom) {
      showToast("请选择代码 1 或代码 2");
      return;
    }
    setRoomId(nextRoom);
    setRole(nextRole);
    window.location.hash = roomHash(nextRoom, nextRole);
  };

  const navigate = (nextRole: Role) => {
    if (!roomId) return;
    window.location.hash = roomHash(roomId, nextRole);
    setRole(nextRole);
  };

  const copyMomLink = async () => {
    if (!roomId) return;
    const link = `${window.location.origin}${window.location.pathname}#${roomHash(roomId, "mom")}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast("妈妈端地址已复制，可以发给妈妈");
    } catch {
      showToast(`当前是代码 ${roomId}，妈妈端也选择这个代码即可`);
    }
  };

  const leaveRoom = () => {
    setRoomId("");
    setRole("customer");
    setOrders([]);
    setCart({});
    window.location.hash = "";
  };

  const updateQuantity = (item: MenuItem, delta: number) => {
    setCart((current) => {
      const quantity = Math.max(0, (current[item.id] ?? 0) + delta);
      const next = { ...current };
      if (quantity === 0) delete next[item.id];
      else next[item.id] = quantity;
      return next;
    });
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedItems.length) {
      showToast("先挑一道想吃的菜吧");
      return;
    }
    const now = new Date().toISOString();
    const nextOrder: Order = {
      id: createOrderId(),
      customer: customer.trim() || "我",
      note: note.trim(),
      items: selectedItems,
      createdAt: now,
      updatedAt: now,
    };
    let nextOrders: Order[];
    try {
      nextOrders = await requestRemoteOrders("POST", nextOrder);
    } catch {
      setSyncMode("local");
      nextOrders = [nextOrder, ...orders];
    }
    applyOrders(nextOrders);
    setLastOrderId(nextOrder.id);
    setCart({});
    setNote("");
    showToast("订单已经递到妈妈厨房啦");
  };

  const clearOrders = async () => {
    try {
      const nextOrders = await requestRemoteOrders("DELETE");
      applyOrders(nextOrders);
    } catch {
      setSyncMode("local");
      applyOrders([]);
    }
    showToast("订单记录已清空");
  };

  const deleteOrder = async (order: Order) => {
    if (!window.confirm(`确定删除 ${order.customer} 的这单吗？`)) return;
    try {
      const nextOrders = await requestRemoteOrders("DELETE", undefined, order.id);
      applyOrders(nextOrders);
    } catch {
      setSyncMode("local");
      applyOrders(orders.filter((current) => current.id !== order.id));
    }
    showToast("这单已经删除");
  };

  if (!roomId) return <RoomGate onSelect={(code) => enterRoom(code)} />;

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand-lockup" onClick={() => navigate("customer")} aria-label="回到妈妈厨房点餐端">
          <span className="brand-stamp">妈</span>
          <span className="brand-copy"><strong>俺妈厨房</strong><small>只给家里人用</small></span>
        </button>
        <div className="role-switcher" aria-label="选择使用栏目">
          <button className={role === "customer" ? "role-button active" : "role-button"} onClick={() => navigate("customer")}>我来点餐</button>
          <button className={role === "mom" ? "role-button active" : "role-button"} onClick={() => navigate("mom")}>妈妈看订单</button>
          <button className={role === "menu" ? "role-button active" : "role-button"} onClick={() => navigate("menu")}>妈妈改菜单</button>
        </div>
        <div className="room-tools"><div className="room-code"><span>代码</span><b>{roomId}</b></div><button className="share-room-button" onClick={() => void copyMomLink()}>复制妈妈端地址</button><div className="sync-pill"><span className="sync-dot" />{syncMode === "cloud" ? "已同步" : "本地备用"}</div><button className="leave-room-button" onClick={leaveRoom}>切换厨房</button></div>
      </header>

      <main>
        {role === "customer" ? (
          <CustomerView
            category={category}
            setCategory={setCategory}
            search={search}
            setSearch={setSearch}
            filteredItems={filteredItems}
            cart={cart}
            selectedItems={selectedItems}
            selectedCount={selectedCount}
            customer={customer}
            setCustomer={setCustomer}
            note={note}
            setNote={setNote}
            updateQuantity={updateQuantity}
            submitOrder={submitOrder}
            lastOrderId={lastOrderId}
            orders={orders}
            navigate={navigate}
          />
        ) : role === "mom" ? (
          <MomView orders={orders} todayOrders={todayOrders} visibleOrders={orders} clearOrders={clearOrders} deleteOrder={deleteOrder} navigate={navigate} />
        ) : (
          <MenuView menu={kitchenMenu} onSaveMenu={saveKitchenMenu} navigate={navigate} />
        )}
      </main>

      <footer className="site-footer"><span>俺妈厨房</span><span>只在咱家用，不对外开放</span><span>点餐端 · 妈妈订单 · 妈妈改菜单</span></footer>
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}

type CustomerViewProps = {
  category: MenuCategory;
  setCategory: (category: MenuCategory) => void;
  search: string;
  setSearch: (value: string) => void;
  filteredItems: MenuItem[];
  cart: Record<string, number>;
  selectedItems: OrderItem[];
  selectedCount: number;
  customer: string;
  setCustomer: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  updateQuantity: (item: MenuItem, delta: number) => void;
  submitOrder: (event: FormEvent<HTMLFormElement>) => void;
  lastOrderId: string;
  orders: Order[];
  navigate: (role: Role) => void;
};

function CustomerView(props: CustomerViewProps) {
  const latestOrder = props.lastOrderId ? props.orders.find((order) => order.id === props.lastOrderId) : undefined;
  return (
    <div className="customer-layout">
      <section className="menu-area" aria-labelledby="menu-title">
        <div className="section-intro-row">
          <div><p className="overline">MENU / 01</p><h2 id="menu-title">今天吃什么？</h2></div>
          <label className="search-box"><span aria-hidden="true">⌕</span><input value={props.search} onChange={(event) => props.setSearch(event.target.value)} placeholder="搜一道菜" aria-label="搜索菜名" /></label>
        </div>
        <div className="category-tabs" role="tablist" aria-label="菜单分类">
          {menuCategories.map((item) => <button key={item} role="tab" aria-selected={props.category === item} className={props.category === item ? "category-tab active" : "category-tab"} onClick={() => props.setCategory(item)}>{item}<span>{props.category === item ? props.filteredItems.length : ""}</span></button>)}
        </div>
        <div className="menu-grid">
          {props.filteredItems.map((item) => <MenuCard key={item.id} item={item} quantity={props.cart[item.id] ?? 0} updateQuantity={props.updateQuantity} />)}
        </div>
        {!props.filteredItems.length && <div className="empty-menu"><span>没有找到这道菜</span><button onClick={() => props.setSearch("")}>看看全部</button></div>}
        <div className="menu-hint"><span className="hint-mark">!</span><span>菜单上的每一道，都是家里吃过、妈妈做过的味道。</span></div>
      </section>
      <aside className="order-side">
        <form className="order-card" onSubmit={props.submitOrder}>
          <div className="order-card-head"><div><p className="overline">ORDER / 02</p><h2>递给妈妈</h2></div><span className="count-badge">{props.selectedCount} 份</span></div>
          {props.selectedItems.length ? <div className="selected-list">{props.selectedItems.map((item) => <div className="selected-row" key={item.id}><span>{item.name}</span><div><button type="button" onClick={() => props.updateQuantity(item, -1)} aria-label={`减少${item.name}`}>−</button><b>{item.quantity}</b><button type="button" onClick={() => props.updateQuantity(item, 1)} aria-label={`增加${item.name}`}>＋</button></div></div>)}</div> : <div className="selected-empty"><span>还没选菜</span><p>从左边挑几道<br />妈妈就知道做什么啦</p></div>}
          <div className="form-fields"><label>怎么称呼你？<input value={props.customer} onChange={(event) => props.setCustomer(event.target.value)} placeholder="比如：小明" /></label><label>想对妈妈说 <span className="optional">选填</span><textarea value={props.note} onChange={(event) => props.setNote(event.target.value)} placeholder="比如：少放辣椒，米饭多来一碗" rows={3} /></label></div>
          <button className="submit-button" type="submit">把订单递过去<span>→</span></button>
          <p className="order-footnote">提交后，妈妈端会马上收到这份菜单</p>
        </form>
        {latestOrder && <div className="sent-card"><span className="sent-check">✓</span><div><strong>订单已送达厨房</strong><p>{latestOrder.id}</p></div><button onClick={() => props.navigate("mom")}>去看订单 →</button></div>}
      </aside>
    </div>
  );
}

function MenuCard({ item, quantity, updateQuantity }: { item: MenuItem; quantity: number; updateQuantity: (item: MenuItem, delta: number) => void }) {
  const index = item.id.match(/(\d+)$/)?.[1] ?? "";
  return <article className={quantity ? "menu-card selected" : "menu-card"}><div className="menu-card-top"><span className="menu-index">{index.padStart(2, "0")}</span><span className="menu-category">{item.category}</span></div><h3>{item.name}</h3><div className="menu-card-bottom">{quantity ? <div className="quantity-control"><button type="button" onClick={() => updateQuantity(item, -1)} aria-label={`减少${item.name}`}>−</button><b>{quantity}</b><button type="button" onClick={() => updateQuantity(item, 1)} aria-label={`增加${item.name}`}>＋</button></div> : <button type="button" className="add-dish" onClick={() => updateQuantity(item, 1)}>加入点单 <span>＋</span></button>}</div></article>;
}

function MomView({ orders, todayOrders, visibleOrders, clearOrders, deleteOrder, navigate }: { orders: Order[]; todayOrders: Order[]; visibleOrders: Order[]; clearOrders: () => void; deleteOrder: (order: Order) => void; navigate: (role: Role) => void }) {
  return <div className="mom-layout"><section className="mom-main"><div className="mom-heading"><div><p className="overline">MOM / 02</p><h2>有人点餐啦。</h2><p>这是咱家今天的订单，收到一单就做一单。</p></div><button className="outline-button" onClick={() => navigate("customer")}>回到点餐端 <span>↗</span></button></div><div className="order-stats"><div><strong>{todayOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}</strong><span>今天要做几道菜</span></div><div><strong>{todayOrders.length}</strong><span>点餐人</span></div></div><div className="mom-list-head"><div><span className="live-dot" />咱家订单</div><span>{visibleOrders.length ? "按最新顺序排列" : "还没有订单"}</span></div><div className="orders-list">{visibleOrders.map((order) => <OrderCard key={order.id} order={order} onDelete={deleteOrder} />)}</div></section><aside className="mom-side"><div className="mom-side-card"><p className="overline">TODAY / NOTE</p><h3>妈妈，辛苦啦。</h3><p>收到订单后照着清单做就好，不需要同步做饭状态。</p><div className="side-line" /><div className="side-stat"><span>全部记录</span><b>{orders.length} 笔</b></div><button className="clear-button" onClick={clearOrders}>清空历史记录</button></div></aside></div>;
}

function MenuView({ menu, onSaveMenu, navigate }: { menu: MenuItem[]; onSaveMenu: (menu: MenuItem[]) => void; navigate: (role: Role) => void }) {
  const activeCount = menu.filter((item) => item.enabled !== false).length;
  return <div className="mom-layout menu-settings-layout"><section className="mom-main"><div className="mom-heading"><div><p className="overline">MENU / 03</p><h2>妈妈改菜单</h2><p>可以自己输入菜品、改名、下架或删除，保存后点餐端会同步。</p></div><button className="outline-button" onClick={() => navigate("customer")}>回到点餐端 <span>↗</span></button></div><MenuEditor menu={menu} onSave={onSaveMenu} /></section><aside className="mom-side"><div className="mom-side-card"><p className="overline">KITCHEN / MENU</p><h3>想吃什么就写什么。</h3><p>这是当前厨房的菜单设置，改完记得保存。</p><div className="side-line" /><div className="side-stat"><span>菜单总数</span><b>{menu.length} 道</b></div><div className="side-stat"><span>点餐中</span><b>{activeCount} 道</b></div><button className="clear-button" onClick={() => navigate("mom")}>去看订单 →</button></div></aside></div>;
}

function MenuEditor({ menu, onSave }: { menu: MenuItem[]; onSave: (menu: MenuItem[]) => void }) {
  const [draft, setDraft] = useState(menu);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<MenuCategory>("荤菜");

  useEffect(() => setDraft(menu), [menu]);

  const toggleItem = (id: string) => setDraft((current) => current.map((item) => item.id === id ? { ...item, enabled: item.enabled === false } : item));
  const renameItem = (id: string, name: string) => setDraft((current) => current.map((item) => item.id === id ? { ...item, name } : item));
  const deleteItem = (id: string) => setDraft((current) => current.filter((item) => item.id !== id));
  const addItem = () => {
    const name = newName.trim();
    if (!name) return;
    setDraft((current) => [...current, { id: `custom-${Date.now()}`, name, category: newCategory, enabled: true }]);
    setNewName("");
  };

  return <div className="menu-editor menu-editor-page"><div className="menu-editor-head"><div><p className="overline">MENU SETTINGS</p><h3>编辑这家菜单</h3></div></div><p className="menu-editor-copy">勾选控制是否在点餐端显示；直接输入可以改菜名，点击“删除”会移除这道菜。</p><div className="menu-editor-list">{menuCategories.map((category) => { const categoryItems = draft.filter((item) => item.category === category); return <div className="menu-editor-group" key={category}><div className="menu-editor-group-head"><span>{category}</span><small>{categoryItems.length} 道</small></div>{categoryItems.length ? categoryItems.map((item) => <div className={item.enabled === false ? "menu-editor-item disabled" : "menu-editor-item"} key={item.id}><input type="checkbox" checked={item.enabled !== false} onChange={() => toggleItem(item.id)} aria-label={`显示${item.name}`} /><input type="text" value={item.name} onChange={(event) => renameItem(item.id, event.target.value)} aria-label={`修改${item.name}`} /><button type="button" className="menu-editor-delete" onClick={() => deleteItem(item.id)}>删除</button></div>) : <p className="menu-editor-empty">还没有菜品</p>}</div>; })}</div><div className="menu-editor-add"><input value={newName} onChange={(event) => setNewName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addItem(); }} placeholder="输入一道新菜" aria-label="新菜名" /><select value={newCategory} onChange={(event) => setNewCategory(event.target.value as MenuCategory)} aria-label="新菜分类">{menuCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select><button type="button" onClick={addItem}>添加</button></div><button type="button" className="menu-editor-save" onClick={() => onSave(draft)}>保存这家菜单</button></div>;
}

function OrderCard({ order, onDelete }: { order: Order; onDelete: (order: Order) => void }) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return <article className="incoming-order"><div className="incoming-top"><div className="incoming-id"><strong>{order.customer}</strong></div><time>{formatTime(order.createdAt)}</time></div><div className="incoming-body"><div><h3>{totalItems} 份菜</h3><p>{order.id}</p></div><ul>{order.items.map((item) => <li key={item.id}><span>{item.name}</span><b>×{item.quantity}</b></li>)}</ul></div>{order.note && <div className="order-note"><span>备注</span>{order.note}</div>}<div className="incoming-foot"><span>下单于 {formatTime(order.createdAt)}</span><button className="delete-order-button" onClick={() => onDelete(order)}>删除这单</button></div></article>;
}

function RoomGate({ onSelect }: { onSelect: (code: string) => void }) {
  return <div className="room-gate"><div className="gate-card"><div className="gate-brand"><span className="brand-stamp">妈</span><div><p className="overline">PRIVATE KITCHEN / 入口</p><h1>俺妈厨房</h1></div></div><p className="gate-lead">先选一家厨房。</p><p className="gate-copy">这里是咱家的点餐本。点餐端和妈妈端进入同一个代码，就能看到对应的订单和菜单。</p><div className="kitchen-picker" role="list" aria-label="选择厨房代码">{KITCHEN_CODES.map((code, index) => <button className="kitchen-choice" key={code} onClick={() => onSelect(code)}><span className="kitchen-choice-top"><b>代码 {code}</b><small>{index === 0 ? "常用" : "备用"}</small></span><span className="kitchen-choice-title">进入厨房 {code}<strong>→</strong></span><span className="kitchen-choice-copy">妈妈和家里人共用这间厨房</span></button>)}</div><p className="gate-footnote">代码只供家里使用。进入厨房后，可以在第三个栏目里管理菜单。</p></div></div>;
}

export default App;
