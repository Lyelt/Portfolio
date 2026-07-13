# Nick's Portfolio

### Showcasing my development skills and personal projects in one neat place.

Link to the website: <https://ghobrial.dev>

Blog post about building the website: <https://ghobrial.dev/blog/portfolio>

Other features of the website:

* [Blog](https://ghobrial.dev/blog)
* [Bowling Tool](https://ghobrial.dev/bowling). See [blog post](https://ghobrial.dev/blog/bowling) for more info.
* [Speedrun Tool](https://ghobrial.dev/speedrun). See [blog post](https://ghobrial.dev/blog/speedrun) for more info.
* [Super Mario 64 Bingo Tool](https://ghobrial.dev/speedrun/bingo)
* [Turn Tracker](https://ghobrial.dev/initiative). See [blog post](https://ghobrial.dev/blog/initiative) for more info.
* [Yu-Gi-Oh Deck Builder](https://ghobrial.dev/yugioh). See [blog post](https://ghobrial.dev/blog/yugioh) for more info.

## Deployment

Portfolio publishes immutable multi-architecture images from `staging` and
`master`. The application repository owns its image, PostgreSQL Compose model,
migrations, deployment adapter, and backups; the private
`Lyelt/MacMiniInfrastructure` repository owns the shared Mac mini, Caddy,
Cloudflare Tunnel, Docker network, and runner installation. See
[HOSTING_SETUP.md](HOSTING_SETUP.md) for the application operations contract.
