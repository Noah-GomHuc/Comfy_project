import os
import server
from aiohttp import web

# HOME_APPS
WEBROOT_APPS = os.path.join(os.path.dirname(os.path.realpath(__file__)), "home")

@server.PromptServer.instance.routes.get("/home")
def apps_entrance(request):
    return web.FileResponse(os.path.join(WEBROOT_APPS, "index.html"))

server.PromptServer.instance.routes.static("/home/", 
path=os.path.join(WEBROOT_APPS))  # Ruta para servir el archivo config.json

#Esto lo meti por si las, porque le saltaba la ficha que no estaba / funcionaba pero daba un 'IMPORT FAIL'
NODE_CLASS_MAPPINGS = {}
__all__ = ['NODE_CLASS_MAPPINGS']


