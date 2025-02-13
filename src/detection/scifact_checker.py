from sentence_transformers import SentenceTransformer, util
import torch

# Use a public model for demonstration purposes
model = SentenceTransformer("distilbert-base-nli-stsb-mean-tokens")

# Base de faits médicaux fiables (tu peux en rajouter d'autres)
trusted_facts = [
    "Les antibiotiques ne sont pas efficaces contre les virus.",
    "Le vaccin contre la grippe réduit le risque d'infection.",
    "Le diabète de type 2 peut être contrôlé avec une alimentation saine."
]

# Encoder les phrases fiables
trusted_embeddings = model.encode(trusted_facts, convert_to_tensor=True)

def check_fact(statement):
    """ Vérifie si une affirmation est proche des faits médicaux connus """
    statement_embedding = model.encode(statement, convert_to_tensor=True)

    # Calculer la similarité avec les faits fiables
    similarity_scores = util.pytorch_cos_sim(statement_embedding, trusted_embeddings)

    # Trouver la similarité maximale
    max_similarity = torch.max(similarity_scores).item()

    return {
        "statement": statement,
        "max_similarity": max_similarity,
        "is_trusted": max_similarity > 0.7  # Threshold for considering the statement as trusted
    }