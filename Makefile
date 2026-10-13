# Makefile
.PHONY: help catalog catalog-check install dev dev-study build preview test typecheck clean stills

.DEFAULT_GOAL := help

STUDY ?= intent-cascade
LAB_DIR := products/lab
PROJECT ?=

help: ## 显示帮助信息
	@echo "LightUI workspace commands"
	@echo ""
	@echo "STUDY=$(STUDY)"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

catalog: ## 从 studies/*/study.json 生成 docs/catalog.md 与 README 标记块
	node scripts/sync-catalog.mjs
	@sed -n '1,80p' docs/catalog.md

catalog-check: ## 校验 catalog.md 与 README 标记块是否与 study.json 一致
	node scripts/sync-catalog.mjs --check

install: ## 安装 lab、genui 与全部 study 的依赖（npm workspaces）
	npm install

dev: ## 启动 lab（可呈现目录，默认入口）
	npm run dev -w @lightui/lab

dev-study: ## 启动指定 study 的独立 playground
	npm run dev -w @lightui/$(STUDY)

build: ## 构建 lab 与全部 study
	npm run build --workspaces --if-present

preview: ## 预览 lab 构建产物
	npm run preview -w @lightui/lab

test: ## 运行目录一致性检查与全部 workspace 测试
	npm test

typecheck: ## 校验目录产物并类型检查全部 workspace
	npm run typecheck

stills: ## 从本仓库舞台导出 references 静帧
	python3 scripts/capture-stage.py $(if $(PROJECT),--project $(PROJECT),)

clean: ## 清理构建缓存
	@find products studies -type d \( -name dist -o -name .cache \) -exec rm -rf {} +
	@find . -name '.DS_Store' -delete
	@echo "Cleaning completed."
