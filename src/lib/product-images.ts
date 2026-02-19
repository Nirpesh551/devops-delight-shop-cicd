import kubernetesTshirt from "@/assets/kubernetes-tshirt.jpg";
import dockerMug from "@/assets/docker-mug.jpg";
import terraformHoodie from "@/assets/terraform-hoodie.jpg";
import cicdStickers from "@/assets/cicd-stickers.jpg";
import prometheusPoster from "@/assets/prometheus-poster.jpg";
import ansibleNotebook from "@/assets/ansible-notebook.jpg";
import linuxPlush from "@/assets/linux-plush.jpg";
import gitPin from "@/assets/git-pin.jpg";

export const productImageMap: Record<string, string> = {
  "Kubernetes T-Shirt": kubernetesTshirt,
  "Docker Mug": dockerMug,
  "Terraform Hoodie": terraformHoodie,
  "CI/CD Sticker Pack": cicdStickers,
  "Prometheus Poster": prometheusPoster,
  "Ansible Notebook": ansibleNotebook,
  "Linux Penguin Plush": linuxPlush,
  "Git Commit Enamel Pin": gitPin,
};

export const getProductImage = (name: string): string => {
  return productImageMap[name] || "/placeholder.svg";
};
