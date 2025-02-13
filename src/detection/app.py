from flask import Flask, request, jsonify
from scifact_checker import check_fact

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    statement = data.get("statement")

    if not statement:
        return jsonify({"error": "No statement provided"}), 400

    result = check_fact(statement)
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)