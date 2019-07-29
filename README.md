# annotation_wizard
A simple tool that allows you to annotate tokens in a sentence.

## Stack
To learn some of the basics in React/Node.js, the architecture is probably more complex than it needs to be. <br/>
A backend Express server handles simple GET/POST requests with the sentences/annotations. For the frontend, React is chosen as a  platform to model the annotation server.

## Setup
To use the annotation wizard, the following steps are required:

 * Install the necessary node.js and npm versions. Used for development were node `v10.16.0` and npm `6.9.0`.
 * Install the required packages. For this, run `npm install` in *both* the main directory, as well as the `wizard/` subfolder. This is required, since both frontend and backend require different packages.
 * The correct execution requires a file called `secrets.json`. In this file, the following parameters need to be specified:
    * `"password"` (string): A passphrase required for the download of the annotated file, which would otherwise be "publicly" available. We are aware that this is by no means a secure solution, but a simple way to prevent a naive intruder from getting the data.
    * `"counter"` (int): Sentence index from which the server will start serving sentences. Should be initially set to 0.
    * `"annotated"` (int): Stores the number of successfully annotated samples. Should also be initially set to 0.

## Available Server Hooks
The backend server provides the following functionality:
 * `/next` (GET): Serves the sample that is next to be annotated. Importantly, repeatedly calling next will not get different sentences, unless a succesful annotation was `/receive`d, or a sentence was `/skip`ped. The body of the next response is a JSON object consisting of three parameters:
    * The `group` phrase, which is indicative of what should be highlighted.
    * The `sentence`, which consists of the words that are going to be rendered.
    * The number of previous (successful) annotations (`numAnnotations`), which are rendered as an information to the user.
 * `/receive`(POST): Expects a JSON object as body, which in turn expects a property `annotations`, a list of `0`s and `1`s, indicating the corresponding index' relevance. `/receive` increases both the number of annotations displayed, as well as the counter for the sentences, such that subsequent `/next` requests will serve a different sentence.
 * `/skip` (POST): Could honestly probably also be a GET request, but might be suited better for the purpose of later adjustments. Simply increases the counter, but not the number of correct annotations.
 * `/download` (POST): A simple request that will return the file of annotated samples in the return body ("Content-Type" is "text/csv"). The POST body requires a JSON object with a property `"password"`, which has to match the value in `secrets.json`, otherwise the request is rejected.
