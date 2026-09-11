# @lightui/optimistic-rollback

Study package for optimistic UI mutations with snapshot rollback semantics.

The playground teaches three paths — lead, rollback, forbid — without
changing the machine: `isOptimisticAllowed`, snapshot + token, in-place
rollback. High-risk `delete` never flips `current` before ACK.

Follow the LightUI conventions:
- Self-contained in `src/StudyView.tsx` and `src/StageView.tsx`.
- Relative imports only.
- Run `npm test` to test state machine.
