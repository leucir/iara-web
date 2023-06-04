#### From https://platform.openai.com/docs/guides/fine-tuning

## Commands

### pip install --upgrade openai
### export OPENAI_API_KEY="<OPENAI_API_KEY>"
### openai tools fine_tunes.prepare_data -f <LOCAL_FILE>
### openai api fine_tunes.create -t <TRAIN_FILE_ID_OR_PATH> -m <BASE_MODEL> --suffix <CUSTOM_MODEL_NAME>
### openai api fine_tunes.follow -i <YOUR_FINE_TUNE_JOB_ID>
### openai api fine_tunes.list
### openai api fine_tunes.get -i <YOUR_FINE_TUNE_JOB_ID>
### openai api fine_tunes.cancel -i <YOUR_FINE_TUNE_JOB_ID>
### openai api models.delete -i <FINE_TUNED_MODEL>