---
title: ASP.NET Core + Angular Photo Booth App
published: '2018-06-22'
description: Do it yourself
author: David Pine
tags:
  - ASP.NET Core
  - Angular
  - Azure
  - C#
  - Twilio
coverImage:
  src: ./photo-booth.jpeg
  alt: ASP.NET Core + Angular Photo Booth App
---
# Inspiration

I recently returned from Charleston, South Carolina -- where I spoke at __SyntaxCon__. The event was very professionally organized and gave me inspiration for __Cream City Code__. In the main hall, they had a _HALO_ by [Simple Booth](https://www.simplebooth.com/). It serves as a photo booth with a conference-specific backdrop -- which is perfect for sharing the conference experience. I looked into purchasing one but was encouraged to simply write my own... so I did and this blog will detail that process.

Ultimately, the resulting social media share ends up looking something like these (  To open gallery ). It generates an animated image (`*.gif`) from the series of photos taken.

![](./smplbth-one.gif)

![](./smplbth-two.gif)

![](./smplbth-three.gif)

<br/>

## User Workflow

Here's what we want to do.

 1. We need to capture several pictures upon user initiation
 2. We need to create an animated image from these pictures
 3. We need to allow the user to send them to themselves for sharing
 4. We need to reset the state of the app after sharing is complete

That's pretty simple, right?! While the application is idle, we'll provide the live camera view with some branding and a "start" button. Anyone walking by will more than likely see themselves and naturally become curious. The hope is that their curiosity will entice them enough to press the "start" button. Pressing the "start" button leads to more excitement as they're presented with a countdown timer... 3, 2, 1... (Flash, Snap)! Their picture is taken, and this continues a few more times. This ends up sparking a chain reaction where others take notice and join in. There are plenty of opportunities for "photo bombing"!

## Technologies Used

This application is built using the __Angular__ __ASP.NET Core__ SPA template. Additionally, I'm leveraging the following:

| Technology | Purpose  |
|--:|:--|
| [ &nbsp; ImageSharp](https://sixlabors.com/projects/imagesharp/) | Convert several `.png` images into a single `.gif` |
| [ &nbsp; Azure - Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) | Persist generated `.gif` image |
| [ &nbsp; Twilio](https://www.twilio.com/) | Send SMS text message with URL of animated `.gif` image |

The application is up on __GitHub__ here: <a href="https://github.com/IEvangelist/IEvangelist.PhotoBooth" target="_blank">
     &nbsp; IEvangelist.PhotoBooth.
</a>

## Under The Hood

Now that we've familiarized ourselves with what we need to do, let's take a look at how we can approach it. As I mentioned, this is an __ASP.NET Core__ application -- so we'll see a `Program.cs`, `Startup.cs`, and a `Controllers` directory for our __ASP.NET Core Web API__. It is also an __Angular__ application. This too has common conventions and things to look for, such as `components`, `services`, `modules`, `pipes`, etc.

### First The C# Code

Snippet from `Startup.ConfigureServices`

```csharp
// Map services
services.AddTransient<IImageProcessorService, ImageProcessorService>();
services.AddSingleton<IImageRepository, ImageRepository>();
services.AddSingleton<ITextMessagingService, TextMessagingService>();

// Map appsettings.json to class options
services.Configure<ImageProcessingOptions>(
    Configuration.GetSection(nameof(ImageProcessingOptions)));
services.Configure<ImageCaptureOptions>(
    Configuration.GetSection(nameof(ImageCaptureOptions)));
services.Configure<ImageRepositoryOptions>(
    Configuration.GetSection(nameof(ImageRepositoryOptions)));
services.Configure<TwilioOptions>(
    Configuration.GetSection(nameof(TwilioOptions)));
```

We have some unique services being added to our dependency injection (DI) service collection. Later, our controllers can ask for these interfaces and expect the corresponding implementations. Likewise, we map over some sections from our `appsettings.json` configuration to C# classes. These also become available to us later from the perspective of DI. We can ask for `IOptions<ImageProcessOptions>` for example. See [ASP.NET Core - Configuration Tips](/posts/asp-net-core-configuration) for more details.

#### ASP.NET Core Web API

Our application has only one controller with a few actions on it. We have an endpoint that returns various configuration options to the client app, and then a more interesting `api/image/generate` endpoint. If you're eager to learn more, I published an article with details on [ASP.NET Core Web API Attributes](https://www.dotnetcurry.com/aspnet/1390/aspnet-core-web-api-attributes).

```csharp
[Route("api/image")]
public class ImageController : Controller
{
    [HttpGet, Route("options")]
    public IActionResult GetOptions(
        [FromServices] IImageProcessorService imageProcessor)
        => Json(imageProcessor.GetImageOptions());

    [HttpPost, Route("generate")]
    public async Task<IActionResult> Generate(
        [FromBody] ImagesPostRequest imagesPostRequest,
        [FromServices] IImageProcessorService imageProcessor) 
        => Json(await imageProcessor.ProcessImagesAsync(
            $"{Request.Scheme}://{Request.Host}{Request.PathBase}", imagesPostRequest));
}
```

> <cite>__ProTip__</cite>
> Keep your controllers dumb! It is best to delegate their logic to a service, and this simplifies testing.


We ask for the `IImageProcessorService` implementation on the `api/image/options` action. This endpoint simply returns JSON that represents our combined configuration options from some of the various options classes we mapped earlier on startup. These options have information for the client app about animation frame delay, intervals, the number of photos to take, image height and width, etc.

Snippet from `ImageProcessorService.GetOptions`

```csharp
public ImageOptionsResponse GetImageOptions()
    => new ImageOptionsResponse
        {
            AnimationFrameDelay = _processingOptions.FrameDelay,
            IntervalBetweenCountDown = _captureOptions.IntervalBetweenCountDown,
            PhotoCountDownDefault = _captureOptions.PhotoCountDownDefault,
            PhotosToTake = _captureOptions.PhotosToTake,
            ImageHeight = _processingOptions.ImageHeight,
            ImageWidth = _processingOptions.ImageWidth
        };
```

The `api/image/generate` endpoint is the most involved. Again we ask for the image processor service, but this time we call the `ProcessImageAsync`. We are given an `ImagePostRequest` object, that looks like this:

```csharp
public class ImagesPostRequest
{
    public string Phone { get; set; }

    public List<string> Images { get; set; }
}
```

We get the phone number and a list of images -- the images are base64 encoded representations of the photos taken. This is what we're going to process. This method could be broken up some and I'm certainly open to improvements (... I mean, this is open source -- give me a pull request)!

#### Services

First, we convert all the base64 image strings to `byte[]`. We load the first image from the `ImageSharp.Image.Load` method, then the remaining images are loaded and added as frames to the first image frames collection. The resulting image now has several frames and will be saved as a `.gif` file. It is then persisted using __ &nbsp; Azure Blob Storage__, within our `IImageRepository` implementation. Finally, we create a link to our image and text the user the URL with `Twilio`.

Snippet from `ImageProcessorService.ProcessImageAsync`

```csharp
public async Task<ImagesPostResponse> ProcessImagesAsync(
    string baseUrl,
    ImagesPostRequest request)
{
    try
    {
        var id = Guid.NewGuid().ToString();
        var imageBytes =
            request.Images
                    .Select(img => img.Replace(Base64PngImagePrefix, string.Empty))
                    .Select(Convert.FromBase64String)
                    .ToArray();

        var image = Image.Load(imageBytes[0]);
        image.MetaData.RepeatCount = 0;

        for (int i = 1; i < imageBytes.Length; ++ i)
        {
            image.Frames.AddFrame(Image.Load(imageBytes[i]).Frames[0]);
        }

        // Ensure that all the frames have the same delay
        foreach (var frame in image.Frames)
        {
            frame.MetaData.FrameDelay = (int)(_processingOptions.FrameDelay * .1);
        }

        await UploadImageAsync(id, image);
        await _textMessagingService.SendTextAsync(
            $"+{request.Phone}",
            $"Share your photo from Cream City Code! {baseUrl}/images/{id}");

        return new ImagesPostResponse { Id = id, IsSuccessful = true };
    }
    catch (Exception ex)
    {
        ex.TryLogException(_logger);
        return new ImagesPostResponse { IsSuccessful = false, Error = ex.Message }; 
    }
}
```

Snippet from `ImageProcessorService.UploadImageAsync`, here we are naming (and saving) the file and encoding it with the `GifEncoder`. We then upload the image to our repository.

```csharp
private async Task UploadImageAsync(string id, Image<Rgba32> image)
{
    var fileName = $"./{id}.gif";
    var profile = new ExifProfile();
    profile.SetValue(ExifTag.Copyright, _processingOptions.Copyright);
    image.MetaData.ExifProfile = profile;
    image.Save(fileName, _encoder);

    await _imageRepository.UploadImageAsync(id, fileName);
}
```

Snippet from `ImageRepository.UploadImageAsync`.

```csharp
public async Task UploadImageAsync(string id, string filePath)
{
    var container = await _initialization.Value;
    var blob = container.GetBlockBlobReference(id);
    await blob.UploadFromFileAsync(filePath);
    File.Delete(filePath);
}
```

We `await` the `_initialization.Value` which represents the `async` operation to yield a container reference. It's an `AsyncLazy` that ensures the following:

- Create cloud blob client
- Create named `container` reference (if it doesn't already exist)
- Set permissions on `container` for blob types as public access
- Finally return the `container` instance

The `container` instance is then used to get a block blob reference, to which we can upload our local image file. We'll delete the local version when we've uploaded it to __Azure__.

The last piece of the puzzle is that we need to send a text message to the phone number we were given. Twilio makes this extremely easy, in fact when I was reading their documentation about their SDK -- I doubted that was all I needed.

Snippet from `TextMessagingService.SendTextAsync`.

```csharp
public async Task SendTextAsync(string toPhoneNumber, string body)
{
    try
    {
        var message =
            await MessageResource.CreateAsync(
                to: toPhoneNumber,
                from: _twilioOptions.FromPhoneNumber,
                body: body);

        _logger.LogInformation($"Texted {toPhoneNumber}: {body}.");
    }
    catch (Exception ex)
    {
        ex.TryLogException(_logger);
    }            
}
```

## Angular

The __Angular__ application is where a lot of the logic lives. It contains user interactions and workflow. Since it's __Angular__ we'll look at some __TypeScript__. We have an `image.service.ts` that makes HTTP calls out to our Web API. At the time of writing, we had the following components:

| Component | Purpose  |
|--:|:--|
| `app` | Standard __Angular__ application entry point  |
| `audio` | Encapsulates the ability to bind `src` audio files and invoke `async play()` functionality |
| `camera` | Wraps the `<control-wizard>`, `<video>` and `<canvas>` elements, and orchestrates communications between them |
| `controlwizard` | This is the state machine of the overlay for the user workflow -- it toggles various templates into and out of view |
| `numberpad` | A numeric entry markup, which outputs the user input |

When application loads, we first hit the `api/image/options` endpoint -- getting our client settings from the server. See [Angular Http with RxJS Observables](/posts/angular-2-http) for more details on the `HttpClient` from __Angular__. We then set our camera stream to the `video` element on our `CameraComponent`.

Snippet from `CameraComponent.ngAfterViewInit`.

```typescript
if (this.videoElement && this.videoElement.nativeElement) {
    this.video = this.videoElement.nativeElement as HTMLVideoElement;
    if (this.video
        && navigator.mediaDevices
        && navigator.mediaDevices.getUserMedia) {
        navigator
            .mediaDevices
            .getUserMedia({ video: true })
            .then((stream: MediaStream) => this.video.srcObject = stream);

        this.video.height = window.innerHeight;
    }
}
```

The `videoElement` is an `ElementRef` instance -- our component uses the __Angular__ `@ViewChild` decorator to instantiate our reference to the `<video>` element in our template. We assign the `.nativeElement` to our `video` instance which is an `HTMLVideoElement`. Finally, if our browser environment has the ability to `.getUserMedia` we'll ask for the video stream and assign it to our `video` instance. Next, let's explore what kicks things off.

Snippet from `control-wizard.component.html`.

```html
<ccc-audio #startSound
    [src]="'https://www.soundjay.com/switch/sounds/switch-19.mp3'">
</ccc-audio>
<div *ngIf="isIdle">
    <button (click)="start(startSound)">
        <i class="glyphicon glyphicon-camera"></i><br /> Start
    </button>
</div>
```

Our markup had a `ccc-audio` element, we have a reference to this with our `#` syntax -- we can then pass this as an argument to the `start` function on the button `(click)` handler. That function looks like this.

Snippet from `ControlWizardComponent.start`.

```typescript
public async start(sound: AudioComponent) {
    if (sound) {
        await sound.play();
    }
    this.changeState(WizardState.CountingDown);
    this.resetCountDownTimer();
}
```

We play the sound, change the state of the application to `CountingDown` and then `resetCountDownTimer`. The `resetCountDownTimer` simply stops and then restarts the `NodeJS.Timer` instance in a clean manner. The `startCountDownTimer` method is called and it handles the count down and marshaling of photo capturing.

Snippet from `ControlWizardComponent.startCountDownTimer`.

```typescript
private startCountDownTimer(): void {
    this.countDownTimer =
        setInterval(
            () => {                    
                if (this.photosTaken < this.imageOptions.photosToTake) {
                    if (this.photoCountDown === 1) {
                        this.photoCountDown = this.imageOptions.photoCountDownDefault + 1;
                        this.changeState(WizardState.TakingPhoto);
                        const details = {
                            photoCount: this.photosTaken,
                            interval: this.imageOptions.intervalBetweenCountDown
                        };
                        this.takePhoto.emit(details);
                        ++ this.photosTaken;
                    } else {
                        this.changeState(WizardState.CountingDown);
                        -- this.photoCountDown;
                    }
                } else {
                    this.stopCountDownTimer();
                    this.images = [];
                    for (var i = 0; i < this.imageOptions.photosToTake; ++ i) {
                        this.images.push(localStorage.getItem(`${i}.image.png`));
                    }
                    this.startAnimationTimer();
                    this.changeState(WizardState.PresentingPhotos);
                    this.photoCountDown = this.imageOptions.photoCountDownDefault;
                }
            },
            this.imageOptions.intervalBetweenCountDown);
    }
```

The functionality here really just manages iteration counts and state changes. The areas of interest are the `takePhoto.emit`, this is an `EventEmitter` which serves as an `Output`. This means that other components can register to this event and handle the occurrence of the `.emit` invocation. This component has several outputs, again let's just single out the `takePhoto` one for now -- we will need to have a look at the `camera.component.html`.

Snippet from `camera.component.html`.

```html
<div class="video-wrapper" [ngClass]="{ 'camera-flash': isTakingPhoto }">
  <control-wizard (takePhoto)="onTakePhoto($event)" (stateChange)="onStateChanged($event)"
                  (optionsReceived)="onOptionsReceived($event)"></control-wizard>
  <video (window:resize)="adjustVideoHeight($event)" class="black-glow"
         #video autoplay width="640" height="480"
         [ngClass]="{ 'hide': isPresentingPhotos || isTextingLink }"></video>
  <canvas #canvas id="canvas" width="640" height="480" style="display: none;"></canvas>
</div>
```

From this we can see that the `CameraComponent` has an `onTakePhoto` handler. There are other observations to make as part of this, such as the markup itself -- how we're really orchestrating components that work (and communicate) together. The `control-wizard` notifies the `CameraComponent` about state changes and when options are received. When the `control-wizard` issues a `takePhoto` command the `camera` is responsible for taking a photo.

Snippet from `CameraComponent.onTakePhoto`.

```typescript
public onTakePhoto(details: PhotoDetails): void {
    setTimeout(() => {
        if (this.canvas) {
            const context = this.canvas.getContext('2d');
            if (context) {
                context.drawImage(this.video, 0, 0, this.imageWidth, this.imageHeight);
                const url = this.canvas.toDataURL('image/png');
                localStorage.setItem(`${details.photoCount}.image.png`, url);
            }
        }
    }, details.interval / 2);
}
```

I relied on an old blog post from David Walsh - [Camera and Video Control with HTML5](https://davidwalsh.name/browser-camera), it was really helpful! We ask the `canvas` for a `2d` context and then `.drawImage` on the `context` passing our `video` element. We then ask the `canvas` for `.toDataUrl` -- which returns our base64 string representation of the image. We'll put this in `localStorage` for now.

After the configured number of photos has been taken, we'll change the state of the application to `WizardState.PresentingPhotos`. Additionally, we grab all the images from `localStorage` storing them in an array.

Snippet from `ControlWizard.startCountDownTimer`.

```typescript
this.images = [];
for (var i = 0; i < this.imageOptions.photosToTake; ++ i) {
    this.images.push(localStorage.getItem(`${i}.image.png`));
}
```

The conditional markup for the presenting of the photos is simple.

Snippet from `control-wizard.component.html`.

```html
<div *ngIf="isPresentingPhotos" class="card ccc-border black-glow">

    <div class="col-1">
        <img *ngIf="images.length" src="{{ images[animationIndex] }}"
             width="640" height="480" />
    </div>
    <div class="col-2 ccc-bg-cream big bold black-inset">
        <div class="ccc-orange fs-38 black-glow">
            2018
        </div>
        <img height="360" class="black-glow" src="../../assets/ccc-logo.png" />
        <div class="twitter-blue black-glow">
            #DeveloperCommunity
        </div>
    </div>

</div>
```

I opted out of generating the `.gif` on the client side, so instead I simply animate by changing the `img.src` on a timer. Again, we'll properly generate a `.gif` on the server at a later time, but for now this will do just fine.

Snippet from `ControlWizard.startAnimationTimer`.

```typescript
private startAnimationTimer(): void {
    this.stopAnimationTimer();
    this.animationTimer =
        setInterval(() => {
            const index = (this.animationIndex + 1);
            this.animationIndex =
                index >= this.images.length
                    ? 0
                    : index;            
        }, this.imageOptions.animationFrameDelay);
}
```

At this point, the user is presented with the sample animation. They could opt to "retake" the photos or if they're satisfied, they could "send" them. If the select "send" they are presented with the `number-pad` component, which enables them to type in their phone number -- and text a link to their phone for sharing!

## Putting It All Together

Here is a look at the application in action.




## Requirements

To run this locally you'll need a few things setup first. After pulling the bits from __Microsoft's GitHub__ (never thought I get to say that), you need the following:

-  &nbsp; __[ Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/)__ -- Account / ConnectionString
-  &nbsp; __[ Twilio](https://www.twilio.com/docs/sms/quickstart/csharp)__ -- Developer Account ID / AuthToken / From Phone Number

These values should be stored as environment variables with the following names:

- `photoboothconnection`
- `twilioaccountsid`
- `twilioauthtoken`

Finally, feel free to toy around with the other configuration settings as you deem necessary.
