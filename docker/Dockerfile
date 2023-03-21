FROM ubuntu:18.04

MAINTAINER wangjiale <wangjiale@zccp.com>

COPY nodeserver /app/nodeserver
COPY .nodewebrc /app/.nodewebrc

WORKDIR /app

RUN ["chmod", "755", "nodeserver"]

ENTRYPOINT ["/app/nodeserver", "--config", ".nodewebrc"]

EXPOSE 8011