# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

<!-- possible categories: Added, Changed, Deprecated, Removed, Fixed, Security -->

## [0.1.3] - 2021-11-29

### Added

- possibility to pass Ganache options to test environment ([#115]).
- `OnChainQuerier`, which allows to query NFTs owned by an address by
  processing in- and outbound `Transfer` events ([#102]).
- source code documentation to most relevant public API and a [generated
  TypeDoc page](https://perun-network.github.io/erdstall-ts-sdk/) of this API
  ([#118]).
- End-2-end test and prettier check to CI ([#127]).

### Changed

- Use lower-case addresses when JSON marshalling ([#114]).
- `Session` methods that return one or more transactions now return an
  `AsyncGenerator` of those transactions, together with the total amount of
  transactions ([#119]).
- Decreased `pollingInterval` in the test env to speed up tests ([#125]).

### Fixed

- The `EventCache` had several implementation errors. It affects how event
  handlers set before connecting the client are managed ([#100]).

[#100]: https://github.com/perun-network/erdstall-ts-sdk/pull/100
[#102]: https://github.com/perun-network/erdstall-ts-sdk/pull/102
[#114]: https://github.com/perun-network/erdstall-ts-sdk/pull/114
[#115]: https://github.com/perun-network/erdstall-ts-sdk/pull/115
[#118]: https://github.com/perun-network/erdstall-ts-sdk/pull/118
[#119]: https://github.com/perun-network/erdstall-ts-sdk/pull/119
[#125]: https://github.com/perun-network/erdstall-ts-sdk/pull/125
[#127]: https://github.com/perun-network/erdstall-ts-sdk/pull/127

## [0.1.2] - 2021-11-01

Initial release on NPM.

<!-- TODO on new release: add new link and update ref in [unreleased] -->

[unreleased]: https://github.com/perun-network/erdstall-ts-sdk/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/perun-network/erdstall-ts-sdk/releases/tag/v0.1.3
[0.1.2]: https://github.com/perun-network/erdstall-ts-sdk/releases/tag/v0.1.2
