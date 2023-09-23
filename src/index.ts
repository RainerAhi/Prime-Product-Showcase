import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    BloomPlugin,
    DiamondPlugin,
    mobileAndTabletCheck,
    GammaCorrectionPlugin,
    ParallaxCameraControllerPlugin,

    // addBasePlugins,
    CanvasSnipperPlugin,
    MeshStandardMaterial2,
    Color,
    AssetImporter,

    // Color, // Import THREE.js internals
    // Texture, // Import THREE.js internals
} from "webgi";
import "./styles.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

async function setupViewer(){

    // Initialize the viewer
    const viewer = new ViewerApp({
        canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement,
        useRgbm: false,
    })

    const isMobile = mobileAndTabletCheck()
    console.log(isMobile)

    // Add some plugins
    const manager = await viewer.addPlugin(AssetManagerPlugin)
    const camera = viewer.scene.activeCamera
    const position = camera.position
    const target = camera.target
    const exitButton = document.querySelector(".button--exit") as HTMLElement
    const customizerInterface = document.querySelector(".customizer--container") as HTMLElement

    // Add a popup(in HTML) with download progress when any asset is downloading.
    // await viewer.addPlugin(AssetManagerBasicPopupPlugin)

    // Add plugins individually.
    await viewer.addPlugin(GBufferPlugin)
    await viewer.addPlugin(new ProgressivePlugin(32))
    await viewer.addPlugin(new TonemapPlugin(!viewer.useRgbm))
    await viewer.addPlugin(GammaCorrectionPlugin)
    await viewer.addPlugin(SSRPlugin)
    await viewer.addPlugin(BloomPlugin)
    await viewer.addPlugin(DiamondPlugin)

    // Add more plugins not available in base, like CanvasSnipperPlugin which has helpers to download an image of the canvas.
    await viewer.addPlugin(CanvasSnipperPlugin)

    //LOADER
    const importer = manager.importer as AssetImporter

    importer.addEventListener("onProgress", (event) => {
        const progressRatio = (event.loaded / event.total)
        console.log(progressRatio)
        document.querySelector('.progress')?.setAttribute('style', `transform: scaleX(${progressRatio})`)
    })

    importer.addEventListener("onLoad", (event) => {
        gsap.to('.loader', {opacity: 0, delay: 1, onComplete: () =>{
            document.body.style.overflowY = 'auto'
        }})
    })

    // This must be called once after all plugins are added.
    viewer.renderer.refreshPipeline()

    // Import and add a GLB file.
    await viewer.load("./assets/prime1.glb")

    console.log(viewer.scene.modelObject.position)

    viewer.scene.activeCamera.setCameraOptions({controlsEnabled: true})

    //WEBGI UPDATE

    let needsUpdate = true;

    function onUpdate() {
        needsUpdate = true;
        viewer.renderer.resetShadows()
    }

    viewer.addEventListener("preFrame", () => {
        if( needsUpdate ) {
            camera.positionUpdated(true);
            camera.targetUpdated(true);
            needsUpdate = false;
        }
    })

	// SCROLL TO TOP
	document.querySelectorAll('.button--footer')?.forEach(item => {
		item.addEventListener('click', () => {
			window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
		})
	})

    // VIEW MORE
	document.querySelectorAll('.view-more')?.forEach(item => {
		item.addEventListener('click', () => {
			window.scrollTo({ top: 2000, left: 0, behavior: 'smooth' })
		})
	})

}

setupViewer()
