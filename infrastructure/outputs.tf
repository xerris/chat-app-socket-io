output "vpc_id" {
  value = "${aws_vpc.vpc.id}"
}
output "public_subnets" {
  value = ["${aws_subnet.subnet_public.id}"]
}
output "public_route_table_ids" {
  value = ["${aws_route_table.rtb_public.id}"]
}
output "public_instance_1_ip" {
  value = ["${aws_instance.instance1.public_ip}"]
}
output "public_instance_2_ip" {
  value = ["${aws_instance.instance2.public_ip}"]
}

output "redis_endpoint" {
  value = ["${aws_elasticache_cluster.redisCluster.cache_nodes[0].address}"]
}