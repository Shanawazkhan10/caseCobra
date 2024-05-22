"use client"
import HandleComponent from "@/components/HandleComponent";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils"
import { AspectRatio } from "@radix-ui/react-aspect-ratio"
import Image from 'next/image'
import { Rnd } from "react-rnd";
import { Radio, RadioGroup } from '@headlessui/react'
import { COLORS, MODELS } from "@/option-validator";
import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { color } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import "./index.css"
import { useMutation } from "@tanstack/react-query";
import { saveConfig as _saveConfig, saveConfigArgs } from "./action";
import { useRouter } from "next/navigation";
interface DesignConfigurator {
    configId: string, imageURL: string, imageDimension: { height: number, width: number },
}
const DesignConfigurator = ({ configId, imageURL, imageDimension }: DesignConfigurator) => {
    const router = useRouter()
    const { mutate: saveConfig } = useMutation({
        mutationKey: ["save-config"],
        mutationFn: async (args: saveConfigArgs) => {
            await Promise.all([saveConfiguration(), _saveConfig(args)])
        },
        onError: () => {
            toast({
                title: "Somethings went wrong",
                description: "someThings went wrong their was an error on saveConfig",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            router.push(`/configure/preview?${configId}`)
        }
    })
    const plans = [
        { name: 'Startup', ram: '12GB', cpus: '6 CPUs', disk: '256GB SSD disk' },
        { name: 'Business', ram: '16GB', cpus: '8 CPUs', disk: '512GB SSD disk' },
        { name: 'Enterprise', ram: '32GB', cpus: '12 CPUs', disk: '1TB SSD disk' },
    ]
    const phoneCaseRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [options, setOptions] = useState<{
        color: (typeof COLORS)[number]
        model: (typeof MODELS.options)[number]
        // material: (typeof MATERIALS.options)[number]
        // finish: (typeof FINISHES.options)[number]
    }>({
        color: COLORS[0],
        model: MODELS.options[0],
        // material: MATERIALS.options[0],
        // finish: FINISHES.options[0],
    })
    const [renderDimension, setRenderDimension] = useState({
        width: imageDimension?.width / 4,
        height: imageDimension?.height / 4,
    })
    const [renderPosition, setRenderPosition] = useState({
        x: 150,
        y: 205
    })
    const { startUpload, isUploading } = useUploadThing("imageUploader",
        // {
        //     onClientUploadComplete: ([data]) => {
        //         const configId = data.serverData.configId
        //         startTransition(() => {
        //             router.push(`/configure/design?id=${configId}`)
        //         })
        //     },
        //     onUploadProgress(p) {
        //         setUpdateProgress(p)
        //     }
        // }
    )
    async function saveConfiguration() {
        try {
            const {
                left: caseLeft,
                top: caseTop,
                width,
                height,
            } = phoneCaseRef.current!.getBoundingClientRect()

            const { left: containerLeft, top: containerTop } =
                containerRef.current!.getBoundingClientRect()

            const leftOffset = caseLeft - containerLeft
            const topOffset = caseTop - containerTop

            const actualX = renderPosition.x - leftOffset
            const actualY = renderPosition.y - topOffset
            //  create canvas
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')

            interface Window {
                Image: {
                    prototype: HTMLImageElement;
                    new(): HTMLImageElement;
                };
            }
            // create image 
            var userImage = new window.Image()
            userImage.crossOrigin = 'anonymous'
            userImage.src = imageURL
            await new Promise((resolve) => (userImage.onload = resolve))

            // paste image 
            ctx?.drawImage(
                userImage,
                actualX,
                actualY,
                renderDimension.width,
                renderDimension.height
            )
            // conversion to file 
            const base64 = canvas.toDataURL()
            const base64Data = base64.split(',')[1]

            const blob = base64ToBlob(base64Data)
            const file = new File([blob], 'filename.png', { type: 'image/png' })
            console.log('====================================');
            console.log(file);
            console.log('====================================');
            await startUpload([file], { configId })
        } catch (err) {
            toast({
                title: 'Something went wrong',
                description:
                    'There was a problem saving your config, please try again.',
                variant: 'destructive',
            })
        }
    }


    function base64ToBlob(base64: String, contentType = 'image/png', chunkLength = 512) {
        const byteCharsArray = Array.from(atob(base64.substr(base64.indexOf(',') + 1)));
        const chunksIterator = new Array(Math.ceil(byteCharsArray.length / chunkLength));
        const bytesArrays = [];

        for (let c = 0; c < chunksIterator.length; c++) {
            bytesArrays.push(new Uint8Array(byteCharsArray.slice(c * chunkLength, chunkLength * (c + 1)).map(s => s.charCodeAt(0))));
        }

        const blob = new Blob(bytesArrays, { type: contentType });

        return blob;
    }
    return (
        <div className='relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-20 pb-20'>
            <div
                ref={containerRef}
                className='relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'>
                {true ? <>

                    <div className='relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]'>
                        <AspectRatio
                            ref={phoneCaseRef}
                            ratio={896 / 1831}
                            className='pointer-events-none relative z-50 aspect-[896/1831] w-full'>
                            <Image
                                fill
                                alt='phone image'
                                src='/phone-template.png'
                                className='pointer-events-none z-50 select-none'
                            />
                        </AspectRatio>
                        <div className='absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]' />
                        <div
                            className={cn(
                                'absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]',
                                `bg-${options.color.tw}`
                            )}
                        />
                    </div>
                </> : <>
                    <div className=' relative w-96 bg-opacity-50 pointer-events-none aspect-[500/500]'>
                        {/* 896/1831 */}
                        <AspectRatio
                            ref={phoneCaseRef}
                            ratio={500 / 500}
                            className="pointer-events-none relative z-50 aspect-[500/500]"
                        >
                            {/* <Image alt="phone image" fill className="pointer-events-none z-50 select-none" src="/phone-template.png" /> */}
                        </AspectRatio>
                        <div className='absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]' />
                        <div
                            className={cn(
                                'absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]',
                                `bg-${options.color.tw}`
                            )}
                        />
                    </div>
                </>
                }
                <Rnd
                    default={{
                        x: 150,
                        y: 205,
                        width: imageDimension.height / 4,
                        height: imageDimension.width / 4,
                    }}
                    onResizeStop={(_, __, ref, ___, { x, y }) => {
                        setRenderDimension({
                            height: parseInt(ref.style.height.slice(0, -2)),
                            width: parseInt(ref.style.width.slice(0, -2))
                        })
                        setRenderPosition({ x, y })
                    }}
                    onDragStop={(_, data) => {
                        const { x, y } = data
                        setRenderPosition({ x, y })
                    }}
                    className="absolute z-20 border-[3px] border-primary"
                    lockAspectRatio
                    resizeHandleComponent={{
                        bottomLeft: <HandleComponent />,
                        bottomRight: <HandleComponent />,
                        topLeft: <HandleComponent />,
                        topRight: <HandleComponent />,

                    }}
                >
                    <div className="relative w-full h-full">
                        <Image alt="phone image" fill className="pointer-events-none z-50 select-none" src={imageURL} />
                    </div>
                </Rnd>
            </div>
            <div className='h-[37.5rem] m-10 w-full col-span-full lg:col-span-1 flex flex-col bg-white'>
                <ScrollArea className='relative flex-1 overflow-auto'>
                    <div
                        aria-hidden='true'
                        className='absolute z-10 inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none'
                    />

                    <div className='px-8 pt-8'>
                        <h2 className='tracking-tight font-bold text-3xl'>
                            Customize your case
                        </h2>
                    </div>
                    <div className='w-full h-px bg-zinc-200 my-6' />

                    <div className='relative mt-4 h-full flex flex-col justify-between'>
                        <div className='flex flex-col gap-6'>
                            <RadioGroup
                                value={options.color}
                                onChange={(val) => {
                                    setOptions((prev) => ({
                                        ...prev,
                                        color: val,
                                    }))
                                }}>
                                <Label>Color: {options.color.label}</Label>
                                <div className='mt-3 flex items-center space-x-3'>
                                    {COLORS.map((color) => (
                                        <RadioGroup.Option
                                            key={color.label}
                                            value={color}
                                            className={({ active, checked }) =>
                                                cn(
                                                    'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2 border-transparent',
                                                    {
                                                        [`border-${color.tw}`]: active || checked,
                                                    }
                                                )
                                            }>
                                            <span
                                                className={cn(
                                                    `bg-${color.tw}`,
                                                    'h-8 w-8 rounded-full border border-black border-opacity-10'
                                                )}
                                            />
                                        </RadioGroup.Option>
                                    ))}
                                </div>
                            </RadioGroup>
                            <div className='relative flex flex-col gap-3 w-full'>
                                <Label>Model</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant='outline'
                                            role='combobox'
                                            className='w-full justify-between'>
                                            {options.model.label}
                                            {/* <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' /> */}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {MODELS.options.map((model) => (
                                            <DropdownMenuItem
                                                key={model.label}
                                                className={cn(
                                                    'flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100',
                                                    {
                                                        'bg-zinc-100':
                                                            model.label === options.model.label,
                                                    }
                                                )}
                                                onClick={() => {
                                                    setOptions((prev) => ({ ...prev, model }))
                                                }}>
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        model.label === options.model.label
                                                            ? 'opacity-100'
                                                            : 'opacity-0'
                                                    )}
                                                />
                                                {model.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <button onClick={() => saveConfig({
                                    configId,
                                    color: options.color.value,
                                    finish: "smooth",
                                    model: options.model.value,
                                    material: "silicone"
                                })}>Done</button>
                            </div>
                        </div>
                    </div>
                </ScrollArea >
            </div>
        </div>
    )
}

export default DesignConfigurator