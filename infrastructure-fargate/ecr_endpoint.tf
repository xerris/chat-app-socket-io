resource "local_file" "instance_ips" {
    content     = "${aws_ecr_repository.socket-app-repository.repository_url}"
    filename = "${path.module}/ecr_endpoint.txt"
}
