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

- Keep scroll animation primitives in `src/components/ui/container-scroll-animation.tsx`; use the plain appearance on the academy opening to preserve its unframed identity, and respect reduced-motion preferences.
- Reuse `FloatingMenu` through the academy shell and keep panel tabs in validated route search parameters so role-specific links, browser history, and existing tabs stay synchronized; reserve footer clearance and keep navigation below overlays.
