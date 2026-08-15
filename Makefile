# Makefile
.PHONY: help catalog install dev dev-study build preview test typecheck clean films films-capture films-tts films-render

.DEFAULT_GOAL := help

STUDY ?= intent-cascade
LAB_DIR := products/lab

help: ## 显示帮助信息
	@echo "LightUI workspace commands"
	@echo ""
	@echo "STUDY=$(STUDY)"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

catalog: ## 从 studies/*/study.json 生成 docs/catalog.md
	node scripts/sync-catalog.mjs
	@sed -n '1,80p' docs/catalog.md

install: ## 安装 lab 与全部 study 的依赖（npm workspaces）
	npm install

dev: ## 启动 lab（可呈现目录，默认入口）
	npm run dev -w @lightui/lab

dev-study: ## 启动指定 study 的独立 playground
	npm run dev -w @lightui/$(STUDY)

build: ## 构建 lab 与全部 study
	npm run build --workspaces --if-present

preview: ## 预览 lab 构建产物
	npm run preview -w @lightui/lab

test: ## 运行全部 workspace 测试
	npm run test --workspaces --if-present

typecheck: ## 类型检查全部 workspace
	npm run typecheck --workspaces --if-present

films-capture: ## 从运行中的 lab 截取 studies/*/references 截图
	npm run capture --prefix tools/study-films

films-tts: ## 用 VoxCPM2 合成讲解旁白
	npm run tts --prefix tools/study-films

films-render: ## Remotion 渲染并写回 references/*.mp4
	npm run render --prefix tools/study-films

films: ## 截图 + 旁白 + 渲染（lab 需在 127.0.0.1:5173）
	npm run films --prefix tools/study-films

clean: ## 清理构建缓存
	@find products studies -type d \( -name dist -o -name .cache \) -exec rm -rf {} +
	@find . -name '.DS_Store' -delete
	@echo "Cleaning completed."
