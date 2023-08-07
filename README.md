# mongo-tools

## Features

- Compare indexes between two MongoDB databases and find redundant indexes.
- Generate an HTML report with the comparison results.

## Usage

### Compare Indexes

This command allows you to compare indexes between two MongoDB databases.

```
compareIndexes [db1] [db2] --output [output_file_path]
```

### List Redundant Indexes

This command helps you identify redundant indexes in a MongoDB database.

```
redundantIndexes [db] --output [output_file_path]
```
