# flowboard

a brutalist-style task manager app built on next.js 14. handles the basics (todo -> doing -> done) without the enterprise bloat.

i was looking for a really simple task manager that wasn't bloated with 100 features i'll never use. decided to build my own. flowboard is a brutalist-style kanban app built with next.js.

it handles the basics: you can create projects, add people, and move tasks around (todo -> doing -> done).

### stack
- next.js 14
- tailwind css
- simple JWT auth (using `jose`)
- `ogl` for the thread animation on the landing page

### setup

honestly, running this is super easy. i got annoyed having to set up postgres or docker just to test a side project, so i threw together a mock in-memory database that actually survives next.js hot reloads. 

you literally just need to do this:

```bash
npm install
cp  .env.example .env
npm run dev
```

then go to `http://localhost:3000`

### quick notes
- the DB wipes if the actual node process restarts. it's strictly for local dev/testing right now.
- want to see the admin features? just select "Admin" when you register a new account on the UI. no manual DB tweaks needed.

feel free to fork or mess around with it.
