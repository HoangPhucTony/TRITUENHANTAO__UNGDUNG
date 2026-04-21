from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.neighbors import KNeighborsRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.tree import DecisionTreeRegressor

MODELS_DIR = Path(__file__).resolve().parents[2] / "Analysis" / "outputs" / "models"
DATA_PATH = Path(__file__).resolve().parents[2] / "Analysis" / "outputs" / "data" / "phongtro_cleaned.csv"
MODEL_PREFERENCE_ORDER = ["xgb", "rf", "knn", "tree", "linear"]
ENSEMBLE_WEIGHTS = {"rf": 0.4, "xgb": 0.4, "knn": 0.2}
MODEL_METADATA = [
    {
        "key": "linear",
        "name": "Linear Regression",
        "type": "basic",
        "MAE": 1.25,
        "RMSE": 1.55,
        "R2": 0.65,
        "MAPE": 18.5,
        "color": "#eab308",
        "speed": 95,
        "interpret": 95,
        "features": "Tất cả feature sau encoding",
        "whyChosen": "Baseline dễ giải thích và rất nhanh.",
        "characteristics": "Giả định quan hệ tuyến tính giữa feature và giá.",
        "weakness": "Khó bắt tương tác phi tuyến.",
    },
    {
        "key": "tree",
        "name": "Decision Tree",
        "type": "basic",
        "MAE": 0.85,
        "RMSE": 1.15,
        "R2": 0.82,
        "MAPE": 12.1,
        "color": "#f97316",
        "speed": 88,
        "interpret": 90,
        "features": "Tất cả feature",
        "whyChosen": "Trực quan khi cần giải thích rule.",
        "characteristics": "Tách dữ liệu theo dạng if-then.",
        "weakness": "Dễ overfit nếu không kiểm soát độ sâu.",
    },
    {
        "key": "knn",
        "name": "KNN",
        "type": "basic",
        "MAE": 0.92,
        "RMSE": 1.22,
        "R2": 0.78,
        "MAPE": 14.3,
        "color": "#ec4899",
        "speed": 35,
        "interpret": 70,
        "features": "Feature số và categorical sau preprocessing",
        "whyChosen": "Hợp với các phòng có đặc trưng tương tự nhau.",
        "characteristics": "Dự đoán từ các điểm lân cận.",
        "weakness": "Nhạy với scale và chậm hơn ở inference.",
    },
    {
        "key": "rf",
        "name": "Random Forest",
        "type": "advanced",
        "MAE": 0.58,
        "RMSE": 0.78,
        "R2": 0.91,
        "MAPE": 8.8,
        "color": "#10b981",
        "speed": 65,
        "interpret": 50,
        "features": "Tất cả feature",
        "whyChosen": "Ổn định và giảm overfit tốt.",
        "characteristics": "Trung bình từ nhiều cây bootstrap.",
        "weakness": "Khó giải thích hơn cây đơn.",
    },
    {
        "key": "xgb",
        "name": "XGBoost",
        "type": "advanced",
        "MAE": 0.42,
        "RMSE": 0.62,
        "R2": 0.94,
        "MAPE": 6.5,
        "color": "#6366f1",
        "speed": 70,
        "interpret": 40,
        "features": "Tất cả feature và interaction phi tuyến",
        "whyChosen": "Hiệu quả tốt trên dữ liệu tabular.",
        "characteristics": "Boosting tuần tự để sửa lỗi cây trước.",
        "weakness": "Khó giải thích hơn.",
    },
    {
        "key": "ensemble",
        "name": "Ensemble (RF + XGB + KNN)",
        "type": "ensemble",
        "MAE": 0.38,
        "RMSE": 0.55,
        "R2": 0.96,
        "MAPE": 5.8,
        "color": "#8b5cf6",
        "speed": 50,
        "interpret": 45,
        "features": "Kết hợp từ 3 mô hình tốt nhất",
        "whyChosen": "Tăng độ ổn định khi deploy listing.",
        "characteristics": "Weighted average của XGB, RF và KNN.",
        "weakness": "Phức tạp hơn mô hình đơn.",
    },
]


class ModelService:
    def __init__(self) -> None:
        self.models: dict[str, Any] = {}
        self.preprocessor: ColumnTransformer | None = None
        self.load_errors: dict[str, str] = {}
        self.load_models()

    def _create_preprocessor(self, df: pd.DataFrame) -> ColumnTransformer:
        numeric_cols = [
            "sophong",
            "area_m2",
            "has_studio",
            "has_balcony",
            "has_mezzanine",
            "has_furniture",
            "has_new",
            "has_window",
            "has_elevator",
        ]
        categorical_cols = [
            "tieude",
            "dientich",
            "vitri",
            "phanloai",
            "standardized_location",
            "property_type_clean",
            "area_group",
        ]

        numeric_cols = [column for column in numeric_cols if column in df.columns]
        categorical_cols = [column for column in categorical_cols if column in df.columns]

        numeric_transformer = Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))])
        categorical_transformer = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("onehot", OneHotEncoder(handle_unknown="ignore")),
            ]
        )

        return ColumnTransformer(
            transformers=[
                ("num", numeric_transformer, numeric_cols),
                ("cat", categorical_transformer, categorical_cols),
            ],
            remainder="drop",
        )

    def _force_single_thread(self, estimator: Any) -> None:
        if estimator is None:
            return

        if hasattr(estimator, "n_jobs"):
            try:
                estimator.set_params(n_jobs=1)
            except Exception:
                try:
                    setattr(estimator, "n_jobs", 1)
                except Exception:
                    pass

        if isinstance(estimator, Pipeline):
            for _, step in estimator.steps:
                self._force_single_thread(step)

        nested_estimators = getattr(estimator, "estimators_", None)
        if nested_estimators is not None:
            for nested in nested_estimators:
                self._force_single_thread(nested)

        configured_estimators = getattr(estimator, "estimators", None)
        if isinstance(configured_estimators, list):
            for nested in configured_estimators:
                nested_estimator = nested[1] if isinstance(nested, tuple) else nested
                self._force_single_thread(nested_estimator)

    def _register_model(self, key: str, model: Any) -> None:
        self._force_single_thread(model)
        self.models[key] = model

    def load_models(self) -> None:
        model_files = {
            "linear": "LinearRegression_basic_final.joblib",
            "rf": "randomforest_best_model.joblib",
            "xgb": "xgboost_best_model.joblib",
        }

        for key, filename in model_files.items():
            path = MODELS_DIR / filename
            if not path.exists():
                self.load_errors[key] = f"Missing model file: {path.name}"
                continue

            try:
                self._register_model(key, joblib.load(path))
                print(f"Loaded model: {key}")
            except Exception as exc:
                self.load_errors[key] = str(exc)
                print(f"Error loading {key}: {exc}")

        if not DATA_PATH.exists():
            self.load_errors["dataset"] = f"Missing dataset file: {DATA_PATH.name}"
            return

        df = pd.read_csv(DATA_PATH)
        X = df.drop(columns=["giavnd", "price_vnd", "price_per_m2"], errors="ignore")
        y = df["giavnd"]

        self.preprocessor = self._create_preprocessor(X)

        tree_pipe = Pipeline(
            steps=[
                ("preprocessor", self.preprocessor),
                ("model", DecisionTreeRegressor(random_state=42)),
            ]
        )
        tree_pipe.fit(X, y)
        self._register_model("tree", tree_pipe)

        knn_pipe = Pipeline(
            steps=[
                ("preprocessor", self.preprocessor),
                ("model", KNeighborsRegressor(n_neighbors=5)),
            ]
        )
        knn_pipe.fit(X, y)
        self._register_model("knn", knn_pipe)

        print("Trained KNN and DecisionTree on the fly.")

    def get_best_available_model_key(self) -> str | None:
        for key in MODEL_PREFERENCE_ORDER:
            if key in self.models:
                return key
        return None

    def get_listing_model_key(self) -> str | None:
        available_ensemble_parts = [key for key in ENSEMBLE_WEIGHTS if key in self.models]
        if available_ensemble_parts:
            return "ensemble"
        return self.get_best_available_model_key()

    def resolve_model_key(self, requested_key: str) -> str:
        if requested_key in {"auto", "ensemble"}:
            available_ensemble_parts = [key for key in ENSEMBLE_WEIGHTS if key in self.models]
            if available_ensemble_parts:
                return "ensemble"
            return self.get_best_available_model_key() or "xgb"

        if requested_key in self.models:
            return requested_key

        return self.get_best_available_model_key() or requested_key

    def get_model_metadata(self) -> list[dict[str, Any]]:
        available_models = set(self.models)
        metadata = []

        for item in MODEL_METADATA:
            is_available = item["key"] in available_models
            if item["key"] == "ensemble":
                is_available = any(key in available_models for key in ENSEMBLE_WEIGHTS)
            metadata.append({**item, "available": is_available})

        return metadata

    def get_model_metadata_by_key(self, key: str) -> dict[str, Any]:
        for item in self.get_model_metadata():
            if item["key"] == key:
                return item

        return {
            "key": key,
            "name": key,
            "type": "basic",
            "MAE": 0.0,
            "RMSE": 0.0,
            "R2": 0.0,
            "MAPE": 0.0,
            "color": "#64748b",
            "speed": 0,
            "interpret": 0,
            "features": "Unknown",
            "whyChosen": "Metadata not found.",
            "characteristics": "Metadata not found.",
            "weakness": "Metadata not found.",
            "available": False,
        }

    def build_features(
        self,
        *,
        area: float,
        district: str,
        title: str | None = None,
        property_type: str | None = None,
        property_type_key: str | None = None,
        is_studio: bool = False,
        has_balcony: bool = False,
        has_furniture: bool = False,
        has_elevator: bool = False,
        is_new: bool = False,
        has_mezzanine: bool = False,
        has_window: bool = False,
    ) -> dict[str, Any]:
        area_group = "Nhỏ (<25m²)"
        if area > 50:
            area_group = "Lớn (>50m²)"
        elif area >= 25:
            area_group = "Vừa (25-50m²)"

        resolved_title = title or f"Phòng trọ {district} {area}m2"
        resolved_property_type = property_type or "Phòng trọ"
        resolved_property_type_key = property_type_key or "PhongTro"

        return {
            "area_m2": float(area),
            "standardized_location": district,
            "vitri": district,
            "has_studio": bool(is_studio),
            "has_balcony": bool(has_balcony),
            "has_furniture": bool(has_furniture),
            "has_elevator": bool(has_elevator),
            "has_new": bool(is_new),
            "has_mezzanine": bool(has_mezzanine),
            "has_window": bool(has_window),
            "area_group": area_group,
            "property_type_clean": resolved_property_type,
            "phanloai": resolved_property_type_key,
            "sophong": 1,
            "tieude": resolved_title,
            "dientich": f"{area} m²",
        }

    def _prepare_input_frame(self, input_data: dict[str, Any] | list[dict[str, Any]] | pd.DataFrame) -> pd.DataFrame:
        if isinstance(input_data, pd.DataFrame):
            df_input = input_data.copy()
        elif isinstance(input_data, list):
            df_input = pd.DataFrame(input_data)
        else:
            df_input = pd.DataFrame([input_data])

        required_cols = [
            "tieude",
            "dientich",
            "vitri",
            "phanloai",
            "sophong",
            "area_m2",
            "standardized_location",
            "property_type_clean",
            "area_group",
            "has_studio",
            "has_balcony",
            "has_mezzanine",
            "has_furniture",
            "has_new",
            "has_window",
            "has_elevator",
        ]

        for column in required_cols:
            if column in df_input.columns:
                continue

            if column.startswith("has_") or column == "sophong" or column == "area_m2":
                df_input[column] = 0
            else:
                df_input[column] = "Unknown"

        bool_cols = [column for column in df_input.columns if column.startswith("has_") or column == "sophong"]
        for column in bool_cols:
            df_input[column] = df_input[column].astype(int)

        return df_input

    def _predict_with_model(self, model_key: str, df_input: pd.DataFrame) -> float | None:
        model = self.models.get(model_key)
        if model is None:
            return None

        try:
            prediction = model.predict(df_input)[0]
            return float(prediction)
        except Exception as exc:
            self.load_errors[f"predict:{model_key}"] = str(exc)
            print(f"Prediction error for {model_key}: {exc}")
            return None

    def _predict_with_model_many(self, model_key: str, df_input: pd.DataFrame) -> list[float | None]:
        model = self.models.get(model_key)
        if model is None:
            return [None] * len(df_input)

        try:
            predictions = model.predict(df_input)
            return [float(prediction) for prediction in predictions]
        except Exception as exc:
            self.load_errors[f"predict:{model_key}"] = str(exc)
            print(f"Prediction error for {model_key}: {exc}")
            return [None] * len(df_input)

    def predict(self, input_data: dict[str, Any], model_key: str = "xgb") -> float | None:
        df_input = self._prepare_input_frame(input_data)
        resolved_model_key = self.resolve_model_key(model_key)

        if resolved_model_key == "ensemble":
            final_prediction = 0.0
            total_weight = 0.0

            for key, weight in ENSEMBLE_WEIGHTS.items():
                prediction = self._predict_with_model(key, df_input)
                if prediction is None:
                    continue
                final_prediction += prediction * weight
                total_weight += weight

            if total_weight > 0:
                return final_prediction / total_weight

            fallback_key = self.get_best_available_model_key()
            if fallback_key:
                return self._predict_with_model(fallback_key, df_input)
            return None

        direct_prediction = self._predict_with_model(resolved_model_key, df_input)
        if direct_prediction is not None:
            return direct_prediction

        fallback_key = self.get_best_available_model_key()
        if fallback_key and fallback_key != resolved_model_key:
            return self._predict_with_model(fallback_key, df_input)

        return None

    def predict_many(
        self,
        input_rows: list[dict[str, Any]] | pd.DataFrame,
        model_key: str = "xgb",
    ) -> list[float | None]:
        df_input = self._prepare_input_frame(input_rows)
        resolved_model_key = self.resolve_model_key(model_key)

        if resolved_model_key == "ensemble":
            weighted_predictions = [0.0] * len(df_input)
            total_weights = [0.0] * len(df_input)

            for key, weight in ENSEMBLE_WEIGHTS.items():
                predictions = self._predict_with_model_many(key, df_input)
                for index, prediction in enumerate(predictions):
                    if prediction is None:
                        continue
                    weighted_predictions[index] += prediction * weight
                    total_weights[index] += weight

            results: list[float | None] = []
            fallback_key = self.get_best_available_model_key()
            fallback_predictions = None
            if fallback_key:
                fallback_predictions = self._predict_with_model_many(fallback_key, df_input)

            for index, total_weight in enumerate(total_weights):
                if total_weight > 0:
                    results.append(weighted_predictions[index] / total_weight)
                elif fallback_predictions is not None:
                    results.append(fallback_predictions[index])
                else:
                    results.append(None)
            return results

        direct_predictions = self._predict_with_model_many(resolved_model_key, df_input)
        if any(prediction is not None for prediction in direct_predictions):
            return direct_predictions

        fallback_key = self.get_best_available_model_key()
        if fallback_key and fallback_key != resolved_model_key:
            return self._predict_with_model_many(fallback_key, df_input)

        return [None] * len(df_input)


model_service = ModelService()
