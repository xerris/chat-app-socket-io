resource "local_file" "test_endpoint" {
    content     = "${aws_cloudwatch_log_group.cb_log_group.name}"
    filename = "${path.module}/TEST_ENDPOINT.txt"
}
