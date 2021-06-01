
resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "redis-subnet-group"
  subnet_ids = [element(aws_subnet.private[*].id, 0), element(aws_subnet.private[*].id, 1)]
}        
resource "aws_elasticache_cluster" "redisCluster" {
  cluster_id           = "xerris-redis-cluster"
  engine               = "redis"
  node_type            = "cache.t2.micro"
  availability_zone = "us-east-2a"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis3.2"
  engine_version       = "3.2.10"
  port                 = 6379
  subnet_group_name =   aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids = [aws_security_group.ecs_tasks.id, aws_security_group.lb.id]
}
