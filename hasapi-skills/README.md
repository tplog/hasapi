# hasapi-skills（刃 · pi 定制包）

> HasaPi（刃）= 刀刃。开发应如刀：**需求抓准，精准实现。**
> 诊断层来自 brooks-lint（建立在 Frederick Brooks《人月神话》等经典之上，
> 文本中保留这些作者引用——那是刀刃赖以锋利的钢材），
> 实现层来自 mattpocock 的执行链。统一以 hasapi-* 命名。

## 安装

    unzip hasapi-skills.zip -d ~/.pi/agent/skills/

得到 ~/.pi/agent/skills/hasapi-skills/...，pi 递归发现全部 15 个 skill。
确保 ~/.pi/agent/settings.json 内 "enableSkillCommands": true。

> 关键：_shared/ 必须与 hasapi-* 同级（本包已保证）。诊断类 skill 用
> ../_shared/common.md 等相对路径读共享文件，挪动布局会断。

## 15 个 skill（+ _shared 资源）

诊断/质检（6，多数自动触发）—— 钢之背，负责"看得准":
  hasapi-health  hasapi-audit  hasapi-review  hasapi-test  hasapi-debt  hasapi-sweep
实现链（7）—— 刃之锋，负责"切得正":
  hasapi-grilling  hasapi-to-prd  hasapi-to-issues  hasapi-implement
  hasapi-tdd  hasapi-handoff  hasapi-setup
日常高频（2，自动触发）:
  hasapi-diagnosing-bugs（查具体 bug）  hasapi-resolving-merge-conflicts（解合并冲突）

_shared/ 不是 skill（无 SKILL.md），是诊断层共享参考文件，勿删勿改名。

## 自动 vs 手动

- 自然说话即自动触发：hasapi-{health,audit,review,test,debt,sweep,grilling,tdd,
  diagnosing-bugs,resolving-merge-conflicts}
- 必须手动 /skill:name：hasapi-{to-prd,to-issues,implement,handoff,setup}
  （凡是"改外部世界 / 切阶段"的，扳机留给人）

## 推荐节奏（头尾诊断、中间实现）

1. /skill:hasapi-health             进场体检，拿 baseline
2. hasapi-grilling                  逼清需求（刀要抓准的地方，人重仓）
3. /skill:hasapi-to-prd（大功能）→ /skill:hasapi-to-issues   落成 ready-for-agent
4. /skill:hasapi-implement + hasapi-tdd   精准实现（人可 AFK）
5. hasapi-review / hasapi-test      质检（人守闸门，逐条 accept/dismiss）
6. hasapi-debt                      记债进 backlog（可喂回 to-issues）
7. /skill:hasapi-handoff <重点>     趁上下文干净，存档换会话

日常：bug 用 hasapi-diagnosing-bugs；合并卡住用 hasapi-resolving-merge-conflicts。

## 注意

- 每个项目首次使用前跑一次 /skill:hasapi-setup 配好 GitHub issue tracker，
  否则 implement / to-issues 不知道去哪取活、往哪写。
- hasapi-sweep 会自动改代码：只在熟悉某库、想一键清理时手动调，陌生库别用。
- 故意未含 matt 的 review / architecture 类 skill——诊断走 hasapi-review，避免抢活。
- tdd 文本中保留了对 /codebase-design、/domain-modeling 的引用（不在本包内），
  模型会自行适配；如需要可另行补装。
