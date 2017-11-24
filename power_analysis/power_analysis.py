from __future__ import division
import numpy as np
from scipy.stats import binom
import matplotlib.pyplot as plt

H0 = 0.05
H1 = 0.2
num_simulations = 10000
max_subjects = 100

all_likelihoods = []
rejection_probs = []
for num_subjects in range(max_subjects):
	num_heads = np.random.binomial(num_subjects, H1, num_simulations)
	# prob of at least num_heads heads on the null hypothesis
	likelihoods = 1 - binom.cdf(num_heads-1, num_subjects, H0)
	num_reject = len([l for l in likelihoods if l < 0.05])
	rejection_probs.append(num_reject/num_simulations)
	all_likelihoods.append(np.mean(likelihoods))

print '\n(subject, likelihood)'
for i, p in enumerate(rejection_probs):
	print (i, p)

# fig = plt.plot(range(max_subjects), all_likelihoods, 'bo')
# plt.show()
