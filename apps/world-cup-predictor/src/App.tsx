import { useMemo, useState } from "react";
import type { Formation, Lineup, Player } from "@portfolio/contracts";
import { analyzeMatch, formationRules, players, teams, validateLineup, worldCupFixtures, worldCupStandings, worldCupTeamById, type WorldCupFixture, type WorldCupStanding, type WorldCupTeam } from "@portfolio/core";

type Tab = "analysis" | "fixtures" | "lineup" | "community";

const fixtureData = worldCupFixtures;
const standingGroups = worldCupStandings;

const seededLineups: Lineup[] = [
  { id: "seed-1", nickname: "北看台07", slogan: "让技术与勇气同时上场", formation: "4-3-3", playerIds: players.slice(0, 11).map((p) => p.id), captainId: players[8].id, createdAt: "2026-07-15T08:00:00Z", likes: 128 },
  { id: "seed-2", nickname: "战术板收藏家", slogan: "中场决定比赛的温度", formation: "3-5-2", playerIds: players.slice(22, 33).map((p) => p.id), captainId: players[28].id, createdAt: "2026-07-16T02:00:00Z", likes: 86 }
];

const communityStorageKey = "world-xi-community";
const likedStorageKey = "world-xi-liked";

function isLineup(value: unknown): value is Lineup {
  if (!value || typeof value !== "object") return false;
  const lineup = value as Partial<Lineup>;
  return Boolean(
    typeof lineup.id === "string" &&
    typeof lineup.nickname === "string" &&
    typeof lineup.slogan === "string" &&
    typeof lineup.formation === "string" &&
    Array.isArray(lineup.playerIds) &&
    typeof lineup.captainId === "string" &&
    typeof lineup.createdAt === "string" &&
    typeof lineup.likes === "number"
  );
}

function readCommunity(): Lineup[] {
  if (typeof window === "undefined") return seededLineups;
  try {
    const stored = JSON.parse(window.localStorage.getItem(communityStorageKey) || "null");
    const items = Array.isArray(stored) ? stored.filter(isLineup) : [];
    return items.length ? items : seededLineups;
  } catch {
    return seededLineups;
  }
}

function readLikedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(likedStorageKey) || "[]");
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeCommunity(items: Lineup[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(communityStorageKey, JSON.stringify(items));
}

function App() {
  const [tab, setTab] = useState<Tab>("analysis");
  const [community, setCommunity] = useState<Lineup[]>(readCommunity);
  const [likedIds, setLikedIds] = useState<string[]>(readLikedIds);
  const [draft, setDraft] = useState<Lineup | null>(null);

  const publish = (lineup: Lineup) => {
    setCommunity((items) => {
      const next = [lineup, ...items.filter((item) => item.id !== lineup.id)];
      writeCommunity(next);
      return next;
    });
    setTab("community");
  };

  const likeLineup = (id: string) => {
    if (likedIds.includes(id)) return;
    const nextLikedIds = [...likedIds, id];
    setLikedIds(nextLikedIds);
    if (typeof window !== "undefined") window.localStorage.setItem(likedStorageKey, JSON.stringify(nextLikedIds));
    setCommunity((items) => {
      const next = items.map((item) => item.id === id ? { ...item, likes: item.likes + 1 } : item);
      writeCommunity(next);
      return next;
    });
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <button className="logo" onClick={() => setTab("analysis")}><span>WORLD</span>XI<b>LAB</b></button>
        <nav>{(["analysis", "fixtures", "lineup", "community"] as Tab[]).map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{({ analysis: "胜率分析", fixtures: "赛事中心", lineup: "梦幻阵容", community: "阵容广场" })[item]}</button>)}</nav>
        <div className="live-tag"><i /> 2026 世界杯 · 已完赛</div>
      </header>
      <main>
        {tab === "analysis" && <AnalysisPage onCreate={() => setTab("lineup")} />}
        {tab === "fixtures" && <FixturesPage />}
        {tab === "lineup" && <LineupPage onDraft={setDraft} onPublish={publish} />}
        {tab === "community" && <CommunityPage items={community} draft={draft} liked={likedIds} onLike={likeLineup} />}
      </main>
      <footer><span>赛果更新至 2026-07-19</span><b>仅用于赛事信息展示，不构成投注建议</b><span>48 队 · 12 组 · 104 场</span></footer>
    </div>
  );
}

function FixturesPage() {
  const [filter, setFilter] = useState<"all" | "group" | "knockout">("all");
  const [group, setGroup] = useState("全部");
  const featuredFixture = fixtureData[fixtureData.length - 1];
  const featuredHome = worldCupTeamById[featuredFixture.homeId];
  const featuredAway = worldCupTeamById[featuredFixture.awayId];
  const visibleFixtures = fixtureData
    .filter((fixture) => filter === "all" || (filter === "group" && fixture.stage === "小组赛" && (group === "全部" || fixture.group === group)) || (filter === "knockout" && fixture.stage !== "小组赛"))
    .slice()
    .reverse();
  const groupNames = Object.keys(standingGroups);

  return (
    <>
      <section className="page-title fixtures-title">
        <div><p className="kicker">TOURNAMENT CENTER</p><h1>赛事中心</h1><p>48 队、12 组、104 场比赛，所有赛程与赛果均已归档。</p></div>
        <div className="fixture-status"><i />全部比赛已结束<small>决赛：2026-07-19 · 纽约/新泽西</small></div>
      </section>
      <section className="fixture-layout">
        <article className="focus-match dark-card">
          <div className="focus-emblem"><TournamentEmblem compact /></div>
          <div className="card-label">FOCUS MATCH <span>{featuredFixture.stage}</span></div>
          <div className="focus-match-meta"><span>{featuredFixture.date} · {featuredFixture.kickoff}</span><span>{featuredFixture.venue}</span></div>
          <div className="focus-teams">
            <div className="focus-team"><Flag team={featuredHome} large /><b>{featuredHome.name}</b></div>
            <strong><em>{featuredFixture.homeScore}</em><small>—</small><em>{featuredFixture.awayScore}</em></strong>
            <div className="focus-team"><Flag team={featuredAway} large /><b>{featuredAway.name}</b></div>
          </div>
          <div className="focus-result"><span>比赛已结束 · 加时赛</span><b>西班牙夺得冠军</b></div>
        </article>
        <article className="commentary-card">
          <div className="card-label">TOURNAMENT ARCHIVE <span>104</span></div>
          <p className="commentary-label">赛事档案</p>
          <h2>从 48 队出发，<br /><em>到西班牙捧杯。</em></h2>
          <p>小组赛 72 场、淘汰赛 32 场全部完成。页面保留最终比分、点球结果和 12 组积分榜，方便按阶段回看。</p>
          <div className="factor-row"><span>小组赛 72 场</span><span>淘汰赛 32 场</span></div>
        </article>
      </section>
      <section className="fixtures-section">
        <div className="section-heading"><div><p className="kicker">MATCH SCHEDULE · 104 RESULTS</p><h2>赛程与赛果</h2></div><div className="fixture-controls"><div className="sort-tabs fixture-filters"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>全部</button><button className={filter === "group" ? "active" : ""} onClick={() => setFilter("group")}>小组赛</button><button className={filter === "knockout" ? "active" : ""} onClick={() => setFilter("knockout")}>淘汰赛</button></div>{filter === "group" && <select className="group-filter" value={group} onChange={(event) => setGroup(event.target.value)}><option value="全部">全部小组</option>{groupNames.map((item) => <option value={item} key={item}>{item}</option>)}</select>}</div></div>
        <div className="fixture-list">{visibleFixtures.map((fixture) => <FixtureRow fixture={fixture} key={fixture.id} />)}</div>
      </section>
      <section className="standings-layout">
        {Object.entries(standingGroups).map(([group, rows]) => <StandingsCard group={group} rows={rows} key={group} />)}
        <article className="method-card commentary-summary"><div><p className="kicker">DATA NOTE</p><h2>看积分，也看比赛的形状</h2></div><p>小组积分按胜 3 分、平 1 分、负 0 分计算，并按积分、净胜球、进球数排序；淘汰赛的点球结果单独标注。</p><span>赛制说明参考国家体育总局；赛程、比分和最终排名按 FIFA 官方赛事页面整理。</span></article>
      </section>
    </>
  );
}

function TournamentEmblem({ compact = false }: { compact?: boolean }) {
  return <div className={`tournament-emblem${compact ? " compact" : ""}`} aria-label="世界杯奖杯与足球装饰">
    <svg viewBox="0 0 180 220" role="img" aria-hidden="true">
      <path className="pitch-orbit" d="M22 184C50 204 124 204 158 174" />
      <path className="trophy-shadow" d="M58 48H122L117 99C115 121 108 136 90 145C72 136 65 121 63 99Z" />
      <path className="trophy-outer" d="M62 48H118L113 98C111 119 103 132 90 140C77 132 69 119 67 98Z" />
      <path className="trophy-handle" d="M63 57H44C43 80 52 94 70 96M117 57H136C137 80 128 94 110 96" />
      <path className="trophy-neck" d="M78 138H102V164H78Z" />
      <path className="trophy-base" d="M61 164H119L132 180H48Z" />
      <circle className="football" cx="90" cy="79" r="13" />
      <path className="football-lines" d="M90 66L84 74L87 83L96 84L101 76M84 74L76 72M87 83L82 91M96 84L102 91M101 76L108 73" />
      <path className="signal-line" d="M35 31C55 15 76 11 96 15M118 18C133 22 145 31 152 43" />
      <circle className="signal-dot" cx="35" cy="31" r="3" />
      <circle className="signal-dot" cx="152" cy="43" r="3" />
    </svg>
    <span className="emblem-label">WORLD CUP / 26</span>
    <i className="emblem-ball" />
  </div>;
}

function Flag({ team, large = false }: { team: WorldCupTeam; large?: boolean }) {
  return <span className={`flag-badge${large ? " large" : ""}`} role="img" aria-label={`${team.name}国旗`}><span className="flag-emoji">{team.flag}</span><small>{team.code}</small></span>;
}

function FixtureRow({ fixture }: { fixture: WorldCupFixture }) {
  const home = worldCupTeamById[fixture.homeId];
  const away = worldCupTeamById[fixture.awayId];
  const penaltyNote = fixture.note ? `（${fixture.note}）` : "";
  return <article className="fixture-row"><div className="fixture-time"><b>{fixture.date.slice(5)} <small>{fixture.kickoff}</small></b><span>{fixture.stage}{fixture.group ? ` · ${fixture.group}` : ""}</span></div><div className="fixture-teams"><span className="fixture-team"><Flag team={home} />{home.name}</span><strong>{fixture.homeScore} : {fixture.awayScore}<small>{penaltyNote}</small></strong><span className="fixture-team"><Flag team={away} />{away.name}</span></div><div className="fixture-badge completed">已结束<small>{fixture.note || "最终比分"}</small></div></article>;
}

function StandingsCard({ group, rows }: { group: string; rows: WorldCupStanding[] }) {
  const bestGoalDifference = rows.reduce((best, row) => row.goalDifference > best.goalDifference ? row : best);
  return <article className="standings-card"><div className="card-label"><span>{group}</span><span>最终积分</span></div><div className="standings-head"><span>球队</span><span>场次</span><span>胜/平/负</span><span>积分</span></div>{rows.map((row) => { const team = worldCupTeamById[row.teamId]; return <div className="standings-row" key={row.teamId}><b>{row.rank}</b><span className="standing-team"><Flag team={team} />{team.name}</span><span>{row.played}</span><span>{row.won}/{row.drawn}/{row.lost}</span><strong>{row.points}</strong></div>; })}<p className="standings-foot">净胜球最高：{bestGoalDifference.goalDifference > 0 ? `+${bestGoalDifference.goalDifference}` : bestGoalDifference.goalDifference}</p></article>;
}

function AnalysisPage({ onCreate }: { onCreate: () => void }) {
  const [homeId, setHomeId] = useState("arg");
  const [awayId, setAwayId] = useState("fra");
  const home = teams.find((team) => team.id === homeId)!;
  const away = teams.find((team) => team.id === awayId)!;
  const result = useMemo(() => analyzeMatch(home, away), [home, away]);
  const statRows = [
    ["实力排名", home.strength, away.strength, "40%"],
    ["最近5场状态", home.recentForm, away.recentForm, "30%"],
    ["最近5场净胜球", home.goalDifference, away.goalDifference, "20%"],
    ["历史交锋", home.headToHead, away.headToHead, "10%"]
  ];
  return (
    <>
      <section className="hero">
        <div><p className="kicker">PRE-MATCH INTELLIGENCE</p><h1>把赛前判断，<br /><em>变成可解释的数据。</em></h1><p>{teams.length} 支世界杯球队 · 权重公开 · 结果可复算</p></div>
        <div className="hero-actions"><TournamentEmblem /><button className="outline-button" onClick={onCreate}>创建我的梦幻阵容 <span>↗</span></button></div>
      </section>
      <section className="analysis-grid">
        <article className="match-card dark-card">
          <div className="card-label">MATCHUP <span>01</span></div>
          <div className="team-selectors">
            <label className={`team-selector team-flag-bg team-flag-${home.id}`}><small>主队</small><select value={homeId} onChange={(e) => setHomeId(e.target.value)}>{teams.filter((t) => t.id !== awayId).map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}</select><b>{result.score.home}</b><span className="flag-caption">{worldCupTeamById[home.id]?.flag} {worldCupTeamById[home.id]?.code}</span></label>
            <strong>VS</strong>
            <label className={`team-selector team-flag-bg team-flag-${away.id}`}><small>客队</small><select value={awayId} onChange={(e) => setAwayId(e.target.value)}>{teams.filter((t) => t.id !== homeId).map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}</select><b>{result.score.away}</b><span className="flag-caption">{worldCupTeamById[away.id]?.flag} {worldCupTeamById[away.id]?.code}</span></label>
          </div>
          <div className="probability-bar"><span style={{ width: `${result.probability.homeWin}%` }} /><i style={{ width: `${result.probability.draw}%` }} /><b style={{ width: `${result.probability.awayWin}%` }} /></div>
          <div className="probability-legend"><div><b>{result.probability.homeWin}%</b><span>{home.name}胜</span></div><div><b>{result.probability.draw}%</b><span>平局</span></div><div><b>{result.probability.awayWin}%</b><span>{away.name}胜</span></div></div>
        </article>
        <article className="data-card">
          <div className="card-label">WEIGHTED SCORE <span>02</span></div>
          <div className="data-head"><span>指标 / 权重</span><b>{home.name}</b><b>{away.name}</b></div>
          {statRows.map(([label, a, b, weight]) => <div className="data-row" key={String(label)}><span>{label}<small>{weight}</small></span><b>{a}</b><b>{b}</b></div>)}
          <div className="formula">40% 实力 + 30% 状态 + 20% 净胜球 + 10% 交锋</div>
        </article>
      </section>
      <section className="report-card">
        <div className="report-index">AI<br />REPORT</div><div><p className="kicker">STRUCTURED DATA ONLY</p><h2>赛前简报</h2><p>{result.report}</p><div className="factor-row">{result.factors.map((factor) => <span key={factor}>{factor}</span>)}</div></div><span className="stamp">NON-BETTING<br />ADVICE</span>
      </section>
      <section className="method-card">
        <div><p className="kicker">HOW IT WORKS</p><h2>把结论拆成四个可复算的输入</h2></div>
        <p>{result.method}</p>
        <span>{result.disclaimer}</span>
      </section>
    </>
  );
}

function LineupPage({ onDraft, onPublish }: { onDraft: (lineup: Lineup) => void; onPublish: (lineup: Lineup) => void }) {
  const [formation, setFormation] = useState<Formation>("4-3-3");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [captainId, setCaptainId] = useState("");
  const [nickname, setNickname] = useState("匿名教练");
  const [slogan, setSlogan] = useState("用我的方式，踢出答案");
  const selected = players.filter((player) => selectedIds.includes(player.id));
  const validation = validateLineup(formation, selected, captainId);
  const counts = (Object.keys(formationRules[formation]) as Player["position"][]).map((position) => ({ position, current: selected.filter((p) => p.position === position).length, max: formationRules[formation][position] }));

  const togglePlayer = (player: Player) => {
    if (selectedIds.includes(player.id)) {
      setSelectedIds(selectedIds.filter((id) => id !== player.id));
      if (captainId === player.id) setCaptainId("");
      return;
    }
    const positionCount = selected.filter((item) => item.position === player.position).length;
    if (selectedIds.length >= 11 || positionCount >= formationRules[formation][player.position]) return;
    setSelectedIds([...selectedIds, player.id]);
  };

  const makeLineup = (): Lineup => ({ id: crypto.randomUUID(), nickname: nickname.slice(0, 12) || "匿名教练", slogan: slogan.slice(0, 24), formation, playerIds: selectedIds, captainId, createdAt: new Date().toISOString(), likes: 0 });
  const publish = () => { if (!validation.valid) return; const lineup = makeLineup(); onDraft(lineup); onPublish(lineup); };
  const download = () => { if (!validation.valid) return; downloadShareCard(makeLineup(), selected); };

  return (
    <>
      <section className="page-title"><p className="kicker">BUILD YOUR WORLD XI</p><h1>11人梦幻阵容</h1><p>选择阵型与核心球星，在100点预算内组建你的队伍。</p></section>
      <section className="lineup-layout">
        <aside className="builder-panel">
          <div className="card-label">FORMATION</div><div className="formation-tabs">{(["4-3-3", "4-4-2", "3-5-2"] as Formation[]).map((item) => <button className={formation === item ? "active" : ""} onClick={() => { setFormation(item); setSelectedIds([]); setCaptainId(""); }} key={item}>{item}</button>)}</div>
          <div className="count-row">{counts.map((item) => <span className={item.current === item.max ? "done" : ""} key={item.position}>{item.position} {item.current}/{item.max}</span>)}</div>
          <div className="player-list">{players.map((player) => { const active = selectedIds.includes(player.id); const teamId = player.id.split("-")[0]; return <button className={active ? "selected" : ""} onClick={() => togglePlayer(player)} key={player.id}><span className={`pos pos-${player.position.toLowerCase()}`}>{player.position}</span><b>{player.name}</b><small className={`player-team team-flag-bg team-flag-${teamId}`}>{player.team}</small><em>{player.cost}点</em></button>; })}</div>
        </aside>
        <article className="pitch-panel">
          <div className="budget"><span>已选 <b>{selected.length}/11</b></span><span>预算 <b className={validation.cost > 100 ? "over" : ""}>{validation.cost}/100</b></span></div>
          <div className="pitch"><div className="center-circle" />{(["FW", "MF", "DF", "GK"] as Player["position"][]).map((position) => <div className={`pitch-line line-${position.toLowerCase()}`} key={position}>{selected.filter((p) => p.position === position).map((player) => <button className={captainId === player.id ? "captain" : ""} onClick={() => setCaptainId(player.id)} key={player.id}><span>{player.name.slice(0, 1)}</span><b>{player.name}</b></button>)}</div>)}</div>
          <div className="lineup-form"><label>匿名昵称<input maxLength={12} value={nickname} onChange={(e) => setNickname(e.target.value)} /></label><label>短口号<input maxLength={24} value={slogan} onChange={(e) => setSlogan(e.target.value)} /></label></div>
          {!validation.valid && <div className="validation">{validation.errors.slice(0, 3).map((error) => <span key={error}>· {error}</span>)}</div>}
          <div className="action-row"><button disabled={!validation.valid} onClick={download}>下载分享卡</button><button className="primary" disabled={!validation.valid} onClick={publish}>发布到广场 ↗</button></div>
        </article>
      </section>
    </>
  );
}

function CommunityPage({ items, draft, liked, onLike }: { items: Lineup[]; draft: Lineup | null; liked: string[]; onLike: (id: string) => void }) {
  const [sort, setSort] = useState<"latest" | "hot">("latest");
  const sorted = [...items].sort((a, b) => sort === "hot" ? b.likes - a.likes : Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const totalLikes = items.reduce((sum, item) => sum + item.likes, 0);
  return (
    <>
      <section className="page-title community-title"><div><p className="kicker">COMMUNITY GALLERY</p><h1>阵容广场</h1><p>浏览大家的战术想象，为喜欢的阵容投一票。</p></div><div className="sort-tabs"><button className={sort === "latest" ? "active" : ""} onClick={() => setSort("latest")}>最新</button><button className={sort === "hot" ? "active" : ""} onClick={() => setSort("hot")}>最热</button></div></section>
      {draft && <div className="publish-success">阵容“{draft.slogan}”已发布，单用户只能点赞一次。</div>}
      <div className="community-stats"><span><b>{items.length}</b> 份公开阵容</span><span><b>{totalLikes}</b> 次社区投票</span><span>内容保存在当前浏览器</span></div>
      {sorted.length ? <section className="gallery">{sorted.map((lineup, index) => <article className="lineup-card" key={lineup.id}><div className="lineup-visual"><span className="rank">#{String(index + 1).padStart(2, "0")}</span><b>{lineup.formation}</b><div className="mini-pitch">{lineup.playerIds.slice(0, 11).map((id, i) => <i key={`${id}-${i}`} style={{ left: `${16 + (i % 4) * 22}%`, top: `${10 + Math.floor(i / 4) * 33}%` }} />)}</div></div><div className="lineup-info"><small>{lineup.nickname}</small><h3>{lineup.slogan}</h3><span>{new Date(lineup.createdAt).toLocaleDateString("zh-CN")}</span><button className={liked.includes(lineup.id) ? "liked" : ""} onClick={() => onLike(lineup.id)} disabled={liked.includes(lineup.id)}>♥ {lineup.likes}</button></div></article>)}</section> : <div className="empty-community">还没有公开阵容，去梦幻阵容页发布第一份吧。</div>}
    </>
  );
}

function downloadShareCard(lineup: Lineup, selected: Player[]) {
  const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#111a18"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#b8ff38"; ctx.lineWidth = 3; ctx.strokeRect(60, 60, 960, 1230);
  ctx.fillStyle = "#b8ff38"; ctx.font = "700 44px sans-serif"; ctx.fillText("WORLD XI · MY LINEUP", 100, 145);
  ctx.fillStyle = "#ffffff"; ctx.font = "700 78px sans-serif"; ctx.fillText(lineup.formation, 100, 255);
  ctx.font = "700 42px sans-serif"; ctx.fillText(lineup.slogan, 100, 340);
  ctx.font = "30px sans-serif"; selected.forEach((player, index) => ctx.fillText(`${player.position}  ${player.name} · ${player.team}`, 120 + (index % 2) * 450, 460 + Math.floor(index / 2) * 105));
  ctx.fillStyle = "#7d8d87"; ctx.font = "24px sans-serif"; ctx.fillText(`${lineup.nickname} · 非投注建议 · 演示数据`, 100, 1230);
  const link = document.createElement("a"); link.download = `world-xi-${lineup.id}.png`; link.href = canvas.toDataURL("image/png"); link.click();
}

export default App;
