import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import os
import glob

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'data')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def load_data():
    all_files = glob.glob(os.path.join(DATA_DIR, "uber-raw-data-*.csv"))
    df_list = []
    for filename in all_files:
        df = pd.read_csv(filename)
        df_list.append(df)
    return pd.concat(df_list, axis=0, ignore_index=True)

def preprocess_data(df):
    # Convert 'Date/Time' to datetime
    df['Date/Time'] = pd.to_datetime(df['Date/Time'])
    
    # Extract features
    df['year'] = df['Date/Time'].dt.year
    df['hour'] = df['Date/Time'].dt.hour
    df['day_of_week'] = df['Date/Time'].dt.dayofweek
    df['day'] = df['Date/Time'].dt.day
    df['month'] = df['Date/Time'].dt.month
    
    # For demand prediction, we need to aggregate rides per hour and per Lat/Lon block (simplified as Zone)
    # We'll create a simple "Zone" by rounding Lat/Lon to 2 decimal places
    df['lat_bin'] = df['Lat'].round(2)
    df['lon_bin'] = df['Lon'].round(2)
    
    # Aggregate demand
    demand_df = df.groupby(['year', 'month', 'day', 'hour', 'day_of_week', 'lat_bin', 'lon_bin']).size().reset_index(name='ride_count')
    
    return demand_df

def train_models(df):
    X = df[['hour', 'day_of_week', 'month', 'lat_bin', 'lon_bin']]
    y = df['ride_count']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models = {
        'LinearRegression': LinearRegression(),
        'RandomForest': RandomForestRegressor(n_estimators=50, max_depth=12, n_jobs=-1, random_state=42),
        'XGBoost': XGBRegressor(n_estimators=100, max_depth=8, learning_rate=0.1, random_state=42)
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        results[name] = {
            'model': model,
            'metrics': {
                'RMSE': float(rmse),
                'MAE': float(mae),
                'R2': float(r2)
            }
        }
        print(f"{name} Results - R2: {r2:.4f}, RMSE: {rmse:.4f}")
        
        # Save each model
        joblib.dump(model, os.path.join(MODEL_DIR, f"{name.lower()}_model.joblib"))

    # Select and save best model based on R2
    best_model_name = max(results, key=lambda x: results[x]['metrics']['R2'])
    best_model = results[best_model_name]['model']
    joblib.dump(best_model, os.path.join(MODEL_DIR, "best_model.joblib"))
    
    # Save overall performance metrics
    metrics_summary = {name: res['metrics'] for name, res in results.items()}
    joblib.dump(metrics_summary, os.path.join(MODEL_DIR, "metrics_summary.joblib"))
    
    return best_model_name, results

if __name__ == "__main__":
    print("Loading data...")
    raw_df = load_data()
    print(f"Total raw records: {len(raw_df)}")
    
    print("Preprocessing data...")
    demand_df = preprocess_data(raw_df)
    print(f"Total aggregated records: {len(demand_df)}")
    
    best_name, results = train_models(demand_df)
    print(f"\nTraining Complete! Best model: {best_name}")
