import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";

import React from "react";

export default function TermsOfService() {
  return (
    <>
      <Dialog>
        {/* Trigger Button */}
        <DialogTrigger className="text-left text-white underline hover:text-yellow-500">
          Terms of Service
        </DialogTrigger>

        {/* Dialog Content */}
        <DialogContent className="bg-black text-white rounded-md shadow-lg">
          <DialogHeader>
            <DialogTitle className=" text-2xl">Terms of Service</DialogTitle>
            <DialogDescription>
              <ScrollArea className="h-[200px] w-[350px] rounded-md  p-4 bg-gray-800">
                <p>
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  Magnam quisquam ipsam ipsa laborum dignissimos veritatis amet
                  quasi reprehenderit aspernatur, inventore deleniti molestias
                  repellendus minus maiores dicta eligendi sit, magni tempora?
                </p>
                <p>
                  Quos eveniet ipsam inventore, amet magnam itaque odio omnis
                  quia illum dignissimos neque facere fugit expedita mollitia
                  quis laboriosam doloribus ea laborum. Dolore quis quaerat
                  animi itaque consequuntur hic debitis!
                </p>
                <p>
                  Eveniet repudiandae adipisci ipsum possimus laudantium eum
                  perspiciatis dolore doloremque dignissimos dolorum autem,
                  recusandae voluptatum odit commodi voluptas ut facilis, minima
                  quo nihil neque voluptates? Vel aspernatur inventore sed?
                  Perferendis.
                </p>
              </ScrollArea>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
