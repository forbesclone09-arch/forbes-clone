<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- All content is mock data: articles, authors, categories and "Most Read" items live as typed arrays in `src/data/content.ts`. Why: the app is presentation-only for now, so nothing should reach a server or database.
- Every headline, byline and category label renders from that mock data through the shared `ArticleCard` / `SectionHeading` components, and every nav or card link targets a real route. Why: dead links and hardcoded copy make the demo look unfinished.

- Homepage category features derive from the shared article collection and the account drawer uses local UI state only. Why: keep all editorial links consistent while preserving a presentation-only account experience.
- Homepage category mosaics use the shared CategoryMosaic component with one lead, two overlay stories, and up to three compact stories drawn from the category collection. Why: match the editorial reference without duplicating article records or page layouts.
