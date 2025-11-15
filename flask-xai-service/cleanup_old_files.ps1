# Cleanup script for flask-xai-service
# Removes old/broken files and prepares for new comprehensive system

Write-Host "Starting cleanup..." -ForegroundColor Yellow

# Create backup directory with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = ".\data\_backup_old_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Backup data files before deletion
Write-Host "`nBacking up data files..." -ForegroundColor Cyan
Copy-Item ".\data\*" -Destination $backupDir -Recurse -Force

# Delete data folder files (keep only clinical_thresholds.json)
Write-Host "`nCleaning data folder..." -ForegroundColor Cyan
Remove-Item ".\data\cbc information.xlsx" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\COVID-19_CBC_Data.csv" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\dataset_summary.txt" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\Diabetes Classification.csv" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\diabetes_dataset.csv" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\features_test.csv" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\features_test.parquet" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\features_train.csv" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\features_train.parquet" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\label_rules.json" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\preprocessing_report.txt" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\processed_cbc_holdout.csv" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\processed_cbc_training.csv" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\processed_cbc_training_complete.csv" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\sample_10_rows.csv" -Force -ErrorAction SilentlyContinue
Remove-Item ".\data\schema.json" -Force -ErrorAction SilentlyContinue

Write-Host "✓ Data folder cleaned (kept clinical_thresholds.json)" -ForegroundColor Green

# Delete all old models
Write-Host "`nCleaning models folder..." -ForegroundColor Cyan
Remove-Item ".\models\*.joblib" -Force -ErrorAction SilentlyContinue
Remove-Item ".\models\missing_parameters.txt" -Force -ErrorAction SilentlyContinue
Remove-Item ".\models\training_report.txt" -Force -ErrorAction SilentlyContinue
Remove-Item ".\models\training_results.json" -Force -ErrorAction SilentlyContinue

Write-Host "✓ All old models deleted" -ForegroundColor Green

# Delete old scripts
Write-Host "`nCleaning scripts folder..." -ForegroundColor Cyan
Remove-Item ".\scripts\generate_cbc_dataset.py" -Force -ErrorAction SilentlyContinue
Remove-Item ".\scripts\preprocess_cbc_data.py" -Force -ErrorAction SilentlyContinue
Remove-Item ".\scripts\train_cbc_models.py" -Force -ErrorAction SilentlyContinue

Write-Host "✓ Old scripts deleted" -ForegroundColor Green

# Delete old root Python files
Write-Host "`nCleaning root Python files..." -ForegroundColor Cyan
Remove-Item ".\add_missing_status_columns.py" -Force -ErrorAction SilentlyContinue
Remove-Item ".\Diabeteic_classification_preprocessing.py" -Force -ErrorAction SilentlyContinue
Remove-Item ".\explore_data.py" -Force -ErrorAction SilentlyContinue
Remove-Item ".\train_all_parameters.py" -Force -ErrorAction SilentlyContinue
Remove-Item ".\train_model.py" -Force -ErrorAction SilentlyContinue
Remove-Item ".\train_models_proper.py" -Force -ErrorAction SilentlyContinue

Write-Host "✓ Old training scripts deleted" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "`nBackup created at: $backupDir" -ForegroundColor Cyan
Write-Host "`nRemaining structure:" -ForegroundColor Cyan
Write-Host "  data/" -ForegroundColor White
Write-Host "    ✓ clinical_thresholds.json (kept)" -ForegroundColor Green
Write-Host "    → Ready for 5 new dataset files" -ForegroundColor Yellow
Write-Host "`n  models/" -ForegroundColor White
Write-Host "    → Empty, ready for new models" -ForegroundColor Yellow
Write-Host "`n  scripts/" -ForegroundColor White
Write-Host "    → Empty, ready for new scripts" -ForegroundColor Yellow
Write-Host "`n  root/" -ForegroundColor White
Write-Host "    ✓ app.py" -ForegroundColor Green
Write-Host "    ✓ clinical_rules_fallback.py" -ForegroundColor Green
Write-Host "    ✓ medical_text_generator.py" -ForegroundColor Green
Write-Host "    ✓ medical_text_templates_comprehensive.py" -ForegroundColor Green
Write-Host "    ✓ mongo_cache.py" -ForegroundColor Green
Write-Host "`n========================================" -ForegroundColor Yellow
