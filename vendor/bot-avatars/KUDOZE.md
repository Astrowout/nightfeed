# bot-avatars, vendored

The source of [bot-avatars](https://libraries.dev/bots) 0.2.2 by Jakub Antalik (MIT, see `LICENSE`), copied from
`packages/bot-avatars/src` of https://github.com/Jakubantalik/Libraries.dev at commit `387b049`.

It is vendored, not installed from npm, so Plume can wear a sleep mask, which the library does not have.

## Our change

A `mask` kind for the `glasses` prop: a padded satin sleep mask in `accessoryColor`, with piping, an elastic
strap clipped at the body's edge and embroidered closed eyes. It turns with the head like the glasses.

- `types.ts`: `'mask'` added to `BotAvatarGlasses`.
- `wear.ts`: `drawMask()`, called from `drawGlasses()`; `drawGlasses()` takes the accessory colour.
- `draw.ts`: passes `wear.color` to `drawGlasses()`.

Everything else is upstream as it was.

## Updating

Copy the new `src` over this folder, then apply the three changes above again (search for `mask`).
