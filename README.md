## TODO

- Check behaviour of `t.object().and(t.record())` which would result in overwriting data in `object`
- Document that transformers should check and throw on invalid data
- Document that a more specific codec should precede a less specific one. For example `t.date.or(t.string)` instead of `t.string.or(t.date)`
