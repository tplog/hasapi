# AGENTS.md instructions

## 语言设置

1. 思考的时候用中文
2. 中途和用户交互的时候用中文
3. 回复用户的时候用中文

## 特殊指令

1. 如果用户的指令里包含 `gadi`，表示用户的意思是：`give me answer, don't implement`
2. 遇到 `gadi` 时，只提供答案、分析、推理、方案和建议，不直接修改代码，不执行实现

## 发版流程

1. 不要在本地执行 `npm publish`
2. 不依赖本地 npm token
3. npm token 配在 GitHub repo secrets
4. 发版依赖 GitHub tag 触发 `.github/workflows/publish.yml`
5. tag 名必须匹配 `package.json` 版本，例如 `0.1.1` 对应 `v0.1.1`
6. 发版前检查当前版本、工作区状态、打包内容和敏感信息
