# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.3.0] - 2024-10-10
### Improved
- Error messages for mapped types
- Project upgrade (node version, dependencies)
- [Internal] Moved from jest to vitest to reduce config complexity

## [1.2.2] - 2022-01-19
### Fixed
- Merge all object JSON-Schemas before product'ing with JSON-Schema unions during an intersection

### Changed
- Throw an error when an unsupported codec is used in an omit

## [1.2.1] - 2022-01-19
### Added
- Allow boolean and number as literal values

## [1.2.0] - 2022-01-19
### Added
- Added a new `partial` codec to make all fields of an object-like codec optional. Acts similar to TS `Partial<T>`

## [1.1.0] - 2022-01-18
### Added
- Added a new `omit` codec to mask out fields from an object-like codec. Acts similar to TS `Omit<T, mask>`

### Changed
- The `recursive` codec now takes an explicit id as its first argument instead of generating a random on call

## [1.0.0] - 2021-12-13
### Added
- Tests for json-schema generation
- A changelog

### Changed
- Refactored schema generation to be more maintainable

### Fixed
- JSON-Schema's generated from intersections will no longer sometimes result in duplicate entries within `required: []`
- JSON-Schema's generated from intersections containing only unions will no longer result in an empty schema

## [0.1.6] - x-x-x

No Changelog
