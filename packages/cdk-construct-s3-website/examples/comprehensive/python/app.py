import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_s3_website import S3Website, S3WebsiteProps, CustomErrorResponse, GeoRestriction

app = cdk.App()
stack = cdk.Stack(app, "S3WebsiteComprehensiveStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

# Comprehensive S3Website — WAF, CloudFront logging, custom error responses,
# CORS, geo restriction, DNS alias, deployment principals
S3Website(stack, "Website", S3WebsiteProps(
    context=context,
    acm_certificate_arn="arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    additional_aliases=["www.acme-dev-app.example.com"],
    default_root_object="index.html",
    waf_enabled=True,
    cloudfront_access_logging_enabled=True,
    cloudfront_access_log_bucket_id="acme-dev-app-cf-logs",
    cloudfront_access_log_prefix="cf/",
    cors_allowed_origins=["https://acme-dev-app.example.com"],
    custom_error_responses=[
        CustomErrorResponse(http_status=403, response_http_status=200, response_page_path="/index.html", ttl=10),
        CustomErrorResponse(http_status=404, response_http_status=200, response_page_path="/index.html", ttl=10),
    ],
    geo_restriction=GeoRestriction(restriction_type="whitelist", locations=["US", "CA", "GB"]),
    dns_alias_enabled=True,
    parent_zone_id="Z1234567890ABCDEF",
    parent_zone_name="example.com",
    deployment_principal_arns=["arn:aws:iam::123456789012:role/acme-deploy-role"],
    tls_protocol_version="TLSv1.2_2021",
))

app.synth()
