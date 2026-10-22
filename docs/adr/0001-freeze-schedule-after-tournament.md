# Freeze the match schedule after the tournament

The tournament ended on July 19, 2026, so the 104 match results will never change again. We store them in a static file in the repo instead of fetching them live from football-data.org. The live API had become a way for the app to break (an outage or the free tier dropping the 2026 season would show "no matches" with no error), cost an API key, and slowed cold starts on Render, while giving nothing in return.

## Consequences

- `FOOTBALL_DATA_API_KEY` is no longer needed in any environment.
- The frozen file is the only source of match data. If the app is ever reused for another tournament, a live source has to be reintroduced for the period while matches are still being played.
