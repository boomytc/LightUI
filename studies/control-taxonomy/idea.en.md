# Controls

“Make an input” only says something can be typed. First decide **whether this slot is filled in, or picked from answers that already exist**.

## The problem

“Make an input” describes the look: a box you can type in. What actually breaks is **using one machine for both filling and picking**:

- A brief is stuffed into one line, so it has nowhere to go
- An email is drawn as a textarea, so a short value floats in a tall box
- Three shipping options hide in a dropdown, so price and timing cannot be compared
- Five cities force a search box first
- Two hundred colleagues dump into one long list, so nobody can be found
- Interest tags are radio dots, so the second pick wipes the first
- “Agree to terms” is a radio group, so a boolean looks like rival tiers

One text box for all of these makes people fill the wrong slot, fail to compare, fail to search, or treat multi as exclusive.

## The rule

Ask what the person is doing, then land on a machine.

| First | Then | Machine |
| --- | --- | --- |
| Fill it in | One line is enough | Text field |
| Fill it in | A paragraph | Textarea |
| Pick from answers | Several at once | Checkbox |
| Pick from answers, only one | Few, must compare side by side | Radio group |
| Pick from answers, only one | A fixed list of about 5–15, scan it | Select |
| Pick from answers, only one | Many, type to find then pick | Combobox |

The three pairs people mix up:

- **A text field is not a textarea.** Name and email are one line. A bio or a brief is a block, with a count.
- **Visible radios are not a dropdown.** Two to five options have to be seen together to compare. Hide them in a panel only when the list is longer.
- **Searchable is not a short list.** Hundreds of items need typing first. Five cities should not force a query.

To specify one of these, say three things:

1. **Name** — not “an input”
2. **Scene** — a short fill, a paragraph, three tiers to compare, or finding one person among two hundred
3. **Rule** — fill it in / only one / type to find / several at once

Those three, in one sentence, are the “Say it this way” card. Copy it and it is the spec; there is no second way to say it.

A single “agree to terms” is still a checkbox: it is one boolean, not rival tiers.

## Versus “make it an input”

| | One input for everything | Split fill vs pick |
| --- | --- | --- |
| Sign-up email | A tall box, or a search field | One line; empty is claimed on blur |
| A brief | Cramped into one line | A textarea with a count |
| Three shipping options | Hidden in a menu, timing invisible | All visible, only one on |
| City | Search pops first | A short list; close on pick |
| Find a colleague | Two hundred rows dumped | Type to filter, then pick one |
| Interest tags | The second pick clears the first | Stack them; lock the rest at the cap |

## The machine

The tree lives in DOM-free modules: `nextStep`, `chooseControl`, `answersFor`. Filtering is `filterMembers`. The cap is `toggleCapped`.

The Select leaf only shows a short fixed list that closes on pick. A panel can still commit a set, a path, or an action — that is the next question, not this one. A combobox also opens downward, but the question here is how you find the option, not what the panel commits.
