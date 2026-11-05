
import { useEffect, useState } from "react";
import api from "../services/api";

function PlantInformation() {
  const [plants, setPlants] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInformation = async () => {
      try {
        const [plantResponse, diseaseResponse] = await Promise.all([
          api.get("/plants"),
          api.get("/diseases")
        ]);

        setPlants(plantResponse.data.plants || []);
        setDiseases(diseaseResponse.data.diseases || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load plant information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInformation();
  }, []);

  const filteredPlants = plants.filter((plant) =>
    `${plant.name} ${plant.scientificName || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getPlantDiseases = (plantId) => {
    return diseases.filter((disease) => {
      const diseasePlantId =
        disease.plantId?._id || disease.plantId;

      return String(diseasePlantId) === String(plantId);
    });
  };

  return (
    <main className="plant-info-page">
      <div className="plant-info-container">

        <section className="plant-info-heading">
          <span className="eyebrow">PLANT KNOWLEDGE CENTER</span>

          <h1>Explore Plant Information</h1>

          <p>
            Discover plants, understand common diseases,
            recognize symptoms and learn about treatments
            and prevention.
          </p>

          <input
            type="search"
            placeholder="Search plants by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="plant-search"
          />
        </section>

        {loading && (
          <p className="plant-info-message">
            Loading plant information...
          </p>
        )}

        {error && !loading && (
          <div className="plant-info-error">
            {error}
          </div>
        )}

        {!loading && !error && filteredPlants.length === 0 && (
          <div className="plant-info-empty">
            <span>🌱</span>
            <h3>No plants found</h3>
            <p>
              {plants.length === 0
                ? "No plant records are available yet."
                : "Try searching with another plant name."}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="plant-info-list">
            {filteredPlants.map((plant) => {
              const plantDiseases = getPlantDiseases(plant._id);

              return (
                <section
                  className="plant-info-section"
                  key={plant._id}
                >
                  <div className="plant-info-card">

                    {plant.image && (
                      <img
                        src={plant.image}
                        alt={plant.name}
                        className="plant-info-image"
                      />
                    )}

                    <div className="plant-info-details">
                      <span className="plant-category">
                        {plant.category || "Plant"}
                      </span>

                      <h2>{plant.name}</h2>

                      {plant.scientificName && (
                        <p className="scientific-name">
                          {plant.scientificName}
                        </p>
                      )}

                      <p>{plant.description}</p>

                      <span className="disease-count">
                        {plantDiseases.length} diseases available
                      </span>
                    </div>
                  </div>

                  <h3 className="disease-section-title">
                    Common Diseases
                  </h3>

                  {plantDiseases.length === 0 ? (
                    <p className="no-diseases">
                      No disease information available yet.
                    </p>
                  ) : (
                    <div className="disease-info-grid">
                      {plantDiseases.map((disease) => (
                        <article
                          className="disease-info-card"
                          key={disease._id}
                        >
                          {disease.image && (
                            <img
                              src={disease.image}
                              alt={disease.name}
                              className="disease-info-image"
                            />
                          )}

                          <div className="disease-info-content">
                            <h4>{disease.name}</h4>

                            <p>{disease.description}</p>

                            {disease.symptoms?.length > 0 && (
                              <div className="disease-detail">
                                <h5>Symptoms</h5>
                                <ul>
                                  {disease.symptoms.map((symptom, index) => (
                                    <li key={index}>{symptom}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {disease.causes?.length > 0 && (
                              <div className="disease-detail">
                                <h5>Causes</h5>
                                <ul>
                                  {disease.causes.map((cause, index) => (
                                    <li key={index}>{cause}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="treatment-box">
                              <h5>🌿 Treatment</h5>
                              <p>{disease.treatment}</p>
                            </div>

                            {disease.prevention && (
                              <div className="prevention-box">
                                <h5>Prevention</h5>
                                <p>{disease.prevention}</p>
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}

export default PlantInformation;
