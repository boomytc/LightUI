# Glyph sweep

The sweep follows the glyphs. Band width is in `ch`; duration is length times speed — not a box-level sheen.

## The problem

A title shine often animates `background-position` on the whole box, or uses a fixed-pixel band. Short and long lines fall out of step, a type-size change mis-sizes the beam, and the light enters from the box edge instead of the glyphs.

## The rule

The letters are transparent. What you see is two backgrounds clipped to the glyphs with `background-clip: text`: a dim fill (unlit letters) and a 300%-wide gradient band. The only animation is `background-position` from 100% to 0%, so the band enters from the right and exits left.

- The band sits at 50% of a 3×-wide gradient. At the animation endpoints the highlight is fully off-canvas.
- Half-width offset is `spread × 0.5ch`, so the beam tracks type size.
- Duration = character count × speed. Short words finish sooner; long lines stay in step visually. `50%, 100%` hold so the beam rests off-screen before looping.
- Park mode stops the animation and binds Position so you can sit the beam on a cell, then tune spread and angle.

## Versus sweeping the box

| | Box / fixed px | Glyph-follow |
| --- | --- | --- |
| Short vs long | Finish together, or drift | Duration follows length |
| Type size change | Beam too wide or thin | `ch` tracks the type |
| Enter / exit | Cuts in from the box | Enters and leaves the glyphs |
