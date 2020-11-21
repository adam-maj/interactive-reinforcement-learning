from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.environment import *

# Create API endpoint for training model
class TrainModel(APIView):
    def post(self, request, format=None):
        # Get the paramters for creating environment from request post data
        width = request.data["width"]
        height = request.data["height"]
        cargo_locations = request.data["cargo_locations"]
        cargo_destinations = request.data["cargo_destinations"]

        # Initialize reinforcement learning environment
        environment = TruckWorld(width, height, cargo_locations, cargo_destinations)

        # Set hyper parameters for learning
        alpha = 0.1
        gamma = 0.1
        epsilon = 1

        # Initialize Q learning matrix
        Q = np.zeros((len(environment.state_space), len(environment.possible_actions)))
        
        # Train agent with 50k games. Cap each game at 99 moves max.
        num_games = 50000
        total_rewards = np.zeros(num_games)
        maxSteps = 99

        # Here we train for all of our games
        for i in range(num_games):
            # This handy print line just shows us if our algorithm is training properly
            if i % 1000 == 0:
                print("Starting Game ", i)
            
            # Reset all necessary variables before each new game
            done = False
            ep_rewards = 0
            observation = environment.state_space.index(environment.reset())
            
            # Run a maximum of 99 actions per individual game
            for step in range(maxSteps):
                rand = random.uniform(0,1)

                # Here we enable the exploration rate for exploring new states to 
                # determine whether the agent takes a random action or takes the best
                # action based on the Q Matrix.
                if rand > epsilon:
                    action = np.argmax(Q[observation, :])
                else:
                    action = environment.action_space_sample()

                # Here we get the best possible action that the truck can take and we
                # get the state of the environment after the truck takes the action.
                new_observation, reward, done = environment.step(action)
                observation_ = environment.state_space.index(new_observation)
                action_ = np.argmax(Q[observation, :])

                # Here we use a famous reinforcement learning equation used in QLearning
                # called Bellman's Equation to optimize the values in our Q table.
                Q[observation, action] = Q[observation, action] + alpha * (reward + gamma * np.max(Q[observation_, :]) - Q[observation, action])
                
                observation = observation_
                ep_rewards += reward
                
                if done:
                    break
            
            # Here we slowly decrement our exploration rate so that the agent explores
            # less often over time and takes the best action more often.
            if epsilon > 0.1:
                epsilon -= 0.00003
                
            total_rewards[i] = ep_rewards
        
        return Response(Q, status=status.HTTP_200_OK)