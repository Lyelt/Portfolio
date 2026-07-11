FROM python:3.13-slim-bookworm@sha256:fcbd8dfc2605ba7c2eca646846c5e892b2931e41f6227985154a596f26ab8ed7

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    HOME=/tmp

WORKDIR /app

COPY requirements.txt ./
RUN python -m pip install --require-hashes --no-deps --only-binary=:all: -r requirements.txt

COPY convert.py ./

USER 65532:65532

ENTRYPOINT ["python", "/app/convert.py"]
