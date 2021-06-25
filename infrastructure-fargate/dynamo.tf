resource "aws_dynamodb_table" "dynamodb-table" {
  name           = "xerris-socket-app-db"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "PK"
  range_key      = "SK"


  global_secondary_index {
    name            = "SK-PK-inverted-index"
    hash_key        = "SK"
    range_key       = "PK"
    write_capacity  = 5
    read_capacity   = 5
    projection_type = "ALL"
  }

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  tags = {
    "Environment" = var.env
    "Name"        = "xerris-socket-app"
  }
}
