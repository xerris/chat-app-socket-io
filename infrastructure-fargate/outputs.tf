# outputs.tf

output "alb_hostname" {
  value = aws_alb.main.dns_name
}

output "redis_endpoint" {
  value = ["${aws_elasticache_cluster.redisCluster.cache_nodes[0].address}"]
}

# output "ecr_endpoint" {
#   value = aws_ecr_repository.socket-app-repository.repository_url
# }