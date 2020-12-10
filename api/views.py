from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import TokenAuthentication
from worker import conn
from .utils import train
from api.environment import *
from api.models import Matrix
from rq import Queue

class GetModel(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (TokenAuthentication,)

    def post(self, request, format=None):
        width = request.data["width"]
        height = request.data["height"]
        cargo_pickups = request.data["cargo_pickups"]
        cargo_dropoffs = request.data["cargo_dropoffs"]

        try:
            matrix = Matrix.objects.get(width=width, height=height, cargo_pickups=str(cargo_pickups), cargo_dropoffs=str(cargo_dropoffs))
            Q = matrix.decode(matrix.matrix)
            return Response(Q, status=status.HTTP_200_OK)
        except Matrix.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)

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

        # Index of all action mappings
        actions = ["Up", "Down", "Left", "Right", "Pickup", "Dropoff"]

        # Take a maximum of 99 steps
        for step in range(99):
            action = np.argmax(Q[state, :])
            new, reward, done = environment.step(action)
            new_state = environment.state_space.index(new)
            total_reward += reward
            state = new_state

            move = {
                "action": actions[action],
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

        try:
            matrix = Matrix.objects.get(width=width, height=height, cargo_pickups=str(cargo_pickups), cargo_dropoffs=str(cargo_dropoffs))
            return Response(status=status.HTTP_200_OK)
        except Matrix.DoesNotExist:
            try:
                q = Queue(connection=conn)
                q.enqueue(train, width, height, cargo_pickups, cargo_dropoffs)
            except Exception as e:
                return Response(str(e), status=status.HTTP_404_NOT_FOUND)

            return Response(status=status.HTTP_200_OK)