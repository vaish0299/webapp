packer {
  required_plugins {
    amazon = {
      version = ">= 1.1.1"
      source = "github.com/hashicorp/amazon"
    }
  }
}
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-08c40ec9ead489470" # Ubuntu 22.04 LTS
}

variable "ssh_username" {
  type    = string
  default = "ubuntu"
}

# https://www.packer.io/plugins/builders/amazon/ebs
source "amazon-ebs" "myWebApp" {
  ami_name        = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "AMI for CSYE 6225"
  region     = "${var.aws_region}"
  ami_users              = ["307362082106","540422937507"]
  force_deregister       = true
  force_delete_snapshot  = true
  ami_regions = [
    "us-east-1",
  ]
  
  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  instance_type = "t2.micro"
  source_ami    = "${var.source_ami}"
  ssh_username  = "${var.ssh_username}"

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/sda1"
    volume_size           = 8
    volume_type           = "gp2"
  }
}

build {
  sources = ["source.amazon-ebs.myWebApp"]

  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1"
    ]
    scripts = [
      "packer_init.sh"
    ]
  }

  provisioner "file" {
    source      = "./"
    destination = "/home/ubuntu/webapp"
  }

  provisioner "file" {
    source  = "amazon-cloudwatch-agent.json"
    destination   = "/tmp/amazon-cloudwatch-agent.json"
  }

  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1"
    ]
    scripts = [
      "script.sh"
    ]
  }
}

