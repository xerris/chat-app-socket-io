resource "local_file" "ecr_endpoint" {
    content     = "${aws_ecr_repository.socket-app-repository.repository_url}"
    filename = "${path.module}/ecr_endpoint.txt"
}
