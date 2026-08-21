terraform {
  backend "s3" {
    bucket  = "omkar-terraform-state-1907"
    key     = "eks/terraform.tfstate"
    region  = "ap-south-1"
    encrypt = true
  }
}