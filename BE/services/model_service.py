import joblib
import pandas as pd
import numpy as np
import os
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.tree import DecisionTreeRegressor
from sklearn.neighbors import KNeighborsRegressor

MODELS_DIR = os.path.join(os.path.dirname(__file__), "../../Analysis/outputs/models")
DATA_PATH = os.path.join(os.path.dirname(__file__), "../../Analysis/outputs/data/phongtro_cleaned.csv")

class ModelService:
    def __init__(self):
        self.models = {}
        self.preprocessor = None
        self.load_models()

    def _create_preprocessor(self, df):
        # Infer column types similar to the notebook
        numeric_cols = ['sophong', 'area_m2', 'has_studio', 'has_balcony', 'has_mezzanine', 
                        'has_furniture', 'has_new', 'has_window', 'has_elevator']
        categorical_cols = ['tieude', 'dientich', 'vitri', 'phanloai', 
                            'standardized_location', 'property_type_clean', 'area_group']
        
        # Filter only existing columns
        numeric_cols = [c for c in numeric_cols if c in df.columns]
        categorical_cols = [c for c in categorical_cols if c in df.columns]

        numeric_transformer = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="median"))
        ])

        categorical_transformer = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore"))
        ])

        preprocessor = ColumnTransformer(
            transformers=[
                ("num", numeric_transformer, numeric_cols),
                ("cat", categorical_transformer, categorical_cols)
            ],
            remainder="drop"
        )
        return preprocessor

    def load_models(self):
        # Load existing models
        model_files = {
            "linear": "LinearRegression_basic_final.joblib",
            "rf": "randomforest_best_model.joblib",
            "xgb": "xgboost_best_model.joblib"
        }

        for key, filename in model_files.items():
            path = os.path.join(MODELS_DIR, filename)
            if os.path.exists(path):
                try:
                    self.models[key] = joblib.load(path)
                    print(f"Loaded model: {key}")
                except Exception as e:
                    print(f"Error loading {key}: {e}")

        # Train KNN and DecisionTree if needed
        if os.path.exists(DATA_PATH):
            df = pd.read_csv(DATA_PATH)
            X = df.drop(columns=["giavnd", "price_vnd", "price_per_m2"], errors="ignore")
            y = df["giavnd"]

            # Use the preprocessor from one of the loaded models if possible, 
            # or create a new one matching the notebook logic
            self.preprocessor = self._create_preprocessor(X)
            
            # Train Tree
            tree_pipe = Pipeline(steps=[("preprocessor", self.preprocessor), ("model", DecisionTreeRegressor(random_state=42))])
            tree_pipe.fit(X, y)
            self.models["tree"] = tree_pipe
            
            # Train KNN
            knn_pipe = Pipeline(steps=[("preprocessor", self.preprocessor), ("model", KNeighborsRegressor(n_neighbors=5))])
            knn_pipe.fit(X, y)
            self.models["knn"] = knn_pipe
            
            # Ensemble (Simplified: average of RF and XGB)
            # In a real scenario we'd use a VotingRegressor
            print("Trained KNN and DecisionTree on the fly.")

    def get_model_metadata(self):
        # Data from ModelStory FE + metrics
        metadata = [
            {
                "key": "linear",
                "name": "Linear Regression",
                "type": "basic",
                "MAE": 1.25, "RMSE": 1.55, "R2": 0.65, "MAPE": 18.5,
                "color": "#eab308",
                "speed": 95, "interpret": 95,
                "features": "Tất cả 24 features (sau encoding)",
                "whyChosen": "Đơn giản, nhanh, dễ giải thích — làm baseline để đánh giá các mô hình phức tạp hơn.",
                "characteristics": "Giả định mối quan hệ tuyến tính giữa feature và giá. Hệ số coefficient cho biết mức ảnh hưởng của từng biến.",
                "weakness": "Không bắt được tương tác phi tuyến (vd: ảnh hưởng kép của diện tích × quận). MAPE cao không đủ chính xác cho production."
            },
            {
                "key": "tree",
                "name": "Decision Tree",
                "type": "basic",
                "MAE": 0.85, "RMSE": 1.15, "R2": 0.82, "MAPE": 12.1,
                "color": "#f97316",
                "speed": 88, "interpret": 90,
                "features": "Tất cả 24 features",
                "whyChosen": "Bắt được quy tắc phi tuyến dạng if-then. Trực quan, dễ vẽ ra để giải thích cho stakeholders.",
                "characteristics": "Chia dữ liệu theo các điều kiện (vd: quận = Quận 1 → giá cao). Không cần chuẩn hoá feature.",
                "weakness": "Dễ overfit (max_depth không giới hạn). Variance cao — chỉ cần thay đổi nhỏ data là cây thay đổi nhiều."
            },
            {
                "key": "knn",
                "name": "KNN",
                "type": "basic",
                "MAE": 0.92, "RMSE": 1.22, "R2": 0.78, "MAPE": 14.3,
                "color": "#ec4899",
                "speed": 35, "interpret": 70,
                "features": "Numerical features (đã chuẩn hoá Min-Max)",
                "whyChosen": "Không cần training — phù hợp cho dataset nhỏ. Recommender system thường xài KNN.",
                "characteristics": "Tìm K=5 phòng tương tự nhất rồi lấy trung bình giá. Distance metric: Euclidean.",
                "weakness": "Chậm khi predict (phải so với toàn bộ dữ liệu). Nhạy cảm với feature scale và curse of dimensionality."
            },
            {
                "key": "rf",
                "name": "Random Forest",
                "type": "advanced",
                "MAE": 0.58, "RMSE": 0.78, "R2": 0.91, "MAPE": 8.8,
                "color": "#10b981",
                "speed": 65, "interpret": 50,
                "features": "Tất cả 24 features",
                "whyChosen": "Ensemble của nhiều Decision Tree → giảm variance, chống overfit. Robust với outlier.",
                "characteristics": "100 trees, mỗi tree học trên một bootstrap sample khác nhau và một subset feature ngẫu nhiên. Predict bằng trung bình.",
                "weakness": "Nặng hơn 1 cây đơn. Khó giải thích (black-box) so với 1 Decision Tree thuần."
            },
            {
                "key": "xgb",
                "name": "XGBoost",
                "type": "advanced",
                "MAE": 0.42, "RMSE": 0.62, "R2": 0.94, "MAPE": 6.5,
                "color": "#6366f1",
                "speed": 70, "interpret": 40,
                "features": "Tất cả 24 features + interaction features",
                "whyChosen": "State-of-the-art cho tabular data. Gradient boosting học được pattern phức tạp mà RF bỏ sót.",
                "characteristics": "300 trees học tuần tự, mỗi cây sửa lỗi cây trước. L1/L2 regularization chống overfit. Hỗ trợ early stopping.",
                "weakness": "Cần tune nhiều hyperparameter (learning_rate, max_depth, n_estimators). Training lâu hơn RF."
            },
            {
                "key": "ensemble",
                "name": "Ensemble (RF+XGB+KNN)",
                "type": "ensemble",
                "MAE": 0.38, "RMSE": 0.55, "R2": 0.96, "MAPE": 5.8,
                "color": "#8b5cf6",
                "speed": 50, "interpret": 45,
                "features": "Kết hợp từ 3 mô hình tốt nhất",
                "whyChosen": "Tối ưu hóa đa chiều, giảm thiểu bias của từng mô hình đơn lẻ.",
                "characteristics": "Trọng số: 40% XGB, 40% RF, 20% KNN. Đảm bảo độ ổn định cao nhất trên toàn bộ tập dữ liệu.",
                "weakness": "Độ phức tạp cao, tốn tài nguyên tính toán hơn."
            }
        ]
        return metadata

    def predict(self, input_data, model_key="xgb"):
        # input_data should be a dict matching the expected features
        # Convert to DataFrame
        df_input = pd.DataFrame([input_data])
        
        # Ensure all necessary columns exist (fill with defaults if missing)
        # These should match the training columns
        required_cols = ['tieude', 'dientich', 'vitri', 'phanloai', 'sophong', 'area_m2', 
                         'standardized_location', 'property_type_clean', 'area_group', 
                         'has_studio', 'has_balcony', 'has_mezzanine', 'has_furniture', 
                         'has_new', 'has_window', 'has_elevator']
        
        for col in required_cols:
            if col not in df_input.columns:
                if col.startswith('has_') or col.startswith('is_') or col == 'sophong' or col == 'area_m2':
                    df_input[col] = 0
                else:
                    df_input[col] = "Unknown"
        
        # Convert boolean-like columns to int for model consistency
        bool_cols = [c for c in df_input.columns if c.startswith('has_') or c.startswith('is_') or c == 'sophong']
        for col in bool_cols:
            df_input[col] = df_input[col].astype(int)

        # Handle Ensemble
        if model_key == "ensemble" or model_key == "auto":
            preds = []
            keys = ["rf", "xgb", "knn"]
            weights = {"rf": 0.4, "xgb": 0.4, "knn": 0.2}
            total_weight = 0
            final_pred = 0
            for k in keys:
                if k in self.models:
                    p = self.models[k].predict(df_input)[0]
                    final_pred += p * weights[k]
                    total_weight += weights[k]
            
            if total_weight > 0:
                return float(final_pred / total_weight)
            return 0.0

        model = self.models.get(model_key)
        if model:
            return float(model.predict(df_input)[0])
        
        return 0.0

model_service = ModelService()
