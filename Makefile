.PHONY: all dev dist

CONTAINER=steam-gslt
EXECUTABLE=$(shell which docker-compose)
PARAMS=--rm --name="${CONTAINER}" node

all:
	$(EXECUTABLE) run -e "GITHUB_TOKEN=${GITHUB_TOKEN}" $(PARAMS) /bin/ash

dev:
	$(EXECUTABLE) run $(PARAMS) yarn dev

dist:
	$(EXECUTABLE) run $(PARAMS) yarn dist

