import csv
import json

# Convert csv files downloaded from Turk site to readable json to be further processed in R

# Utils
def read_csv_field(filename, col_ind, fieldname):
	out = []
	with open(filename, 'rb') as csvfile:
		reader = csv.reader(csvfile, delimiter=',')
		for row in reader:
			if not(row[col_ind] == fieldname):
				out.append(row[col_ind])
	return out

def save_dict_as_json(d, savename):
	with open(savename, 'w') as outfile:
		json.dump(d, outfile)
	print 'json saved'

def read_data_csv(filename):
	# Read in CSVs for categorization experiment
	fieldnames = ['HitId', 'HitTitle', 'Annotation', 
				  'AssignmentId', 'WorkerId', 'Status', 
				  'AcceptTime', 'SubmitTime', 'Answer 1']

	d = {}
	for i in range(len(fieldnames)):
		d[fieldnames[i]] = read_csv_field(
								filename, i, fieldnames[i])
	return d

def reformat(d):
	# Clean up JSON and save data fields to be analyzed further
	timeline_elements = json.loads(json.loads(d['Answer 1'][0]))

	for t in timeline_elements:
		if 'responses' in t.keys():
			t['responses'] = json.loads(t['responses'])
	
	welcome_block  = timeline_elements[0]
	sort_trials    = timeline_elements[1]
	demographics   = timeline_elements[2]
	problem_report = timeline_elements[3]
	debrief_block  = timeline_elements[4]

	# key experiment data
	configs = sort_trials['configs']
	data    = sort_trials['data']

	print 'Num sort trials = {}'.format(len(data))

	print type(timeline_elements)
	d['Data_reformatted'] = timeline_elements

	out = dict()
	out['HITInfo'] = {'HitId': d['HitId'], 
					  'HitTitle': d['HitTitle'], 
				  	  'AssignmentId': d['AssignmentId'], 
				  	  'WorkerId': d['WorkerId'], 
				  	  'Status': d['Status'], 
				  	  'AcceptTime': d['AcceptTime'], 
				  	  'SubmitTime': d['SubmitTime'],
				  	  'Configs': configs}
	out['Demographics'] = {'Age': demographics['responses']['Q0'],
						   'Gender': demographics['responses']['Q1'],
						   'Education': demographics['responses']['Q2']}
	out['ProblemReport'] = problem_report
	out['Data'] = data

	return out

fnames = ['A1', 'A2']
for f in fnames:
	save_dict_as_json(reformat(read_data_csv(f + '.csv')), f + '.json')

