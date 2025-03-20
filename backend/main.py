from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd
from sklearn.preprocessing import RobustScaler
import logging
from fastapi.responses import JSONResponse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI()

# Add CORS middleware with more specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

# Load the trained model and scaler
try:
    with open('career_predictor.pkl', 'rb') as model_file:
        model = pickle.load(model_file)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    raise Exception("Failed to load model")

try:
    with open('scaler.pkl', 'rb') as scaler_file:
        scaler = pickle.load(scaler_file)
    logger.info("Scaler loaded successfully")
except Exception as e:
    logger.error(f"Error loading scaler: {str(e)}")
    raise Exception("Failed to load scaler")

# Define the input structure using Pydantic
class StudentData(BaseModel):
    gender: int
    part_time_job: int
    extracurricular_activities: int
    math_score: float
    history_score: float
    physics_score: float
    chemistry_score: float
    biology_score: float
    english_score: float
    geography_score: float
    weekly_study_hours: float 

# Define career mapping
career_map = {
    0: 'Software Engineer',
    1: 'Business Owner',
    2: 'Banker',
    3: 'Lawyer',
    4: 'Accountant',
    5: 'Doctor',
    6: 'Real Estate Developer',
    7: 'Stock Investor',
    8: 'Construction Engineer',
    9: 'Artist',
    10: 'Game Developer',
    11: 'Government Officer',
    12: 'Teacher',
    13: 'Designer',
    14: 'Scientist',
    15: 'Writer'
}

# Feature engineering function
def feature_engineering(data):
    try:
        # Convert input data to DataFrame
        df = pd.DataFrame([data.dict()])
        logger.info(f"Input data: {df.to_dict()}")
        
        # Rename weekly_study_hours to weekly_self_study_hours to match scaler
        df['weekly_self_study_hours'] = df['weekly_study_hours']
        df = df.drop('weekly_study_hours', axis=1)
        
        # Calculate derived features
        df['total_score'] = df[['math_score', 'history_score', 'physics_score', 'chemistry_score', 'biology_score', 'english_score', 'geography_score']].sum(axis=1)
        df['avg_score'] = df['total_score'] / 7
        df['stem_score'] = df[['math_score', 'physics_score', 'chemistry_score', 'biology_score']].mean(axis=1)
        df['humanities_score'] = df[['history_score', 'english_score', 'geography_score']].mean(axis=1)
        df['score_std'] = df[['math_score', 'history_score', 'physics_score', 'chemistry_score', 'biology_score', 'english_score', 'geography_score']].std(axis=1)
        df['stem_to_humanities_ratio'] = df['stem_score'] / (df['humanities_score'] + 1e-6)
        df['max_score'] = df[['math_score', 'history_score', 'physics_score', 'chemistry_score', 'biology_score', 'english_score', 'geography_score']].max(axis=1)
        df['min_score'] = df[['math_score', 'history_score', 'physics_score', 'chemistry_score', 'biology_score', 'english_score', 'geography_score']].min(axis=1)
        df['score_range'] = df['max_score'] - df['min_score']
        
        logger.info(f"Processed features: {df.columns.tolist()}")
        return df
    except Exception as e:
        logger.error(f"Error in feature engineering: {str(e)}")
        raise

@app.post("/predict")
async def predict(student: StudentData):
    try:
        logger.info("Received prediction request")
        logger.info(f"Input data: {student.dict()}")
        
        # Convert input data and engineer features
        df_processed = feature_engineering(student)
        logger.info("Features engineered successfully")
        logger.info(f"Processed features shape: {df_processed.shape}")
        logger.info(f"Processed features columns: {df_processed.columns.tolist()}")
        
        # Scale features
        try:
            # Check if the scaler is loaded properly
            if scaler is None:
                raise HTTPException(status_code=500, detail="Scaler not initialized")
            
            # Get the feature names that the scaler was trained on
            scaler_features = scaler.feature_names_in_ if hasattr(scaler, 'feature_names_in_') else None
            if scaler_features is not None:
                logger.info(f"Scaler features: {scaler_features.tolist()}")
                logger.info(f"Input features: {df_processed.columns.tolist()}")
                
                # Check if all required features are present and in the correct order
                missing_features = [f for f in scaler_features if f not in df_processed.columns]
                extra_features = [f for f in df_processed.columns if f not in scaler_features]
                
                if missing_features:
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Missing features for scaling: {missing_features}"
                    )
                
                if extra_features:
                    logger.warning(f"Extra features found (will be ignored): {extra_features}")
                
                # Reorder columns to match scaler's expected order
                if scaler_features is not None:
                    df_processed = df_processed[scaler_features]
                    logger.info(f"Reordered features: {df_processed.columns.tolist()}")
            
            # Perform the scaling
            df_scaled = scaler.transform(df_processed)
            logger.info(f"Data scaled successfully. Scaled data shape: {df_scaled.shape}")
            
        except Exception as e:
            logger.error(f"Error in scaling: {str(e)}")
            logger.error(f"Data that caused the error: {df_processed.to_dict()}")
            raise HTTPException(
                status_code=500, 
                detail=f"Error in data scaling: {str(e)}"
            )
        
        # Make prediction
        try:
            if model is None:
                raise HTTPException(status_code=500, detail="Model not initialized")
            
            # Get probability scores for all classes
            probabilities = model.predict_proba(df_scaled)[0]
            
            # Get indices of top 3 predictions
            top_3_indices = np.argsort(probabilities)[-3:][::-1]
            
            # Get the career names and probabilities for top 3
            predictions = []
            for idx in top_3_indices:
                if idx in career_map:
                    career = career_map[idx]
                    probability = float(probabilities[idx] * 100)  # Convert to percentage
                    predictions.append({
                        "career": career,
                        "probability": round(probability, 2)
                    })
            
            logger.info(f"Top 3 predictions: {predictions}")
            
            if not predictions:
                raise HTTPException(
                    status_code=500,
                    detail="Could not generate valid career predictions"
                )
                
            return {"predictions": predictions}
            
        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error in making prediction: {str(e)}")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))