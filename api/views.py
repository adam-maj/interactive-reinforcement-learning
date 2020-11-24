from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import TokenAuthentication
from api.environment import *

class RunModel(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (TokenAuthentication,)

    def post(self, request, format=None):
        # Get parameters for running game
        q_matrix = request.data["q_matrix"]
        truck_location = request.data["truck_location"]
        
        # Get parameters for creating environment
        width = request.data["width"]
        height = request.data["height"]
        cargo_pickups = request.data["cargo_pickups"]
        cargo_dropoffs = request.data["cargo_dropoffs"]

        # Initialize reinforcement learning environment
        environment = TruckWorld(width, height, cargo_pickups, cargo_dropoffs)

        # Create numpy array from list of lists
        Q = np.asarray(q_matrix)

        # Initialize state
        state = environment.state_space.index(environment.reset())
        total_reward = 0

        # Create array to store game
        game = []

        # Take a maximum of 99 steps
        for step in range(99):
            action = np.argmax(Q[state, :])
            new, reward, done = environment.step(action)
            new_state = environment.state_space.index(new)
            total_reward += reward
            state = new_state

            move = {
                "truck_location": environment.agent_position,
                "cargo_location": environment.cargo_location,
                "cargo_destination": environment.cargo_destination
            }
            
            game.append(move)

            if done:
                break
        
        return Response(game, status=status.HTTP_200_OK)

class TrainModel(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (TokenAuthentication,)

    def post(self, request, format=None):
        # Get the paramters for creating environment from request post data
        width = request.data["width"]
        height = request.data["height"]
        cargo_pickups = request.data["cargo_pickups"]
        cargo_dropoffs = request.data["cargo_dropoffs"]

        # Initialize reinforcement learning environment
        environment = TruckWorld(width, height, cargo_pickups, cargo_dropoffs)

        # Learning rate (how fast you update Q matrix)
        alpha = 0.1

        # Value of future rewards (1 means future rewards are as valuable as current rewards)
        gamma = 0.1

        #Exploration value (0 means always pick the greedy action)
        epsilon = 1

        # Initialize Q learning matrix
        Q = np.zeros((len(environment.state_space), len(environment.possible_actions)))
        
        # Cap the number of games to train model
        max_games = 20000

        # Cap the length of each game at 99 moves
        maxSteps = 99

        # Estimated number of games it will take (to estimate epsilon decay)
        num_games = width * height * len(cargo_pickups) * 100

        # Set rate of epsilon decay (exploration rate decreases over time)
        # This should be smaller with a larger number of games
        epsilon_decay = 0.9 / (num_games * 2)

        # Initialize variables for training
        total_rewards = []
        streak = 0
        i = 0
        
        while i < max_games:
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
                epsilon -= epsilon_decay
                
            # Update the streak (we want a streak of positive reward games)
            if ep_rewards > 0:
                streak += 1
            else:
                streak = 0
            
            # If the model can get 20 in a row its good to go
            if streak > width * height * 2:
                print(f"Took: {i}")
                break
            
            # Complete iteration
            total_rewards.append(ep_rewards)
            i += 1
        
        print(total_rewards[-40:-1]) 

        return Response(Q, status=status.HTTP_200_OK)