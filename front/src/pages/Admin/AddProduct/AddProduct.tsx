import { useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { NormalModal } from "../../../components/Modal/NormalModal";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addProduct } from "../../../api/product/product.service";
import { IndexUploadFile } from "../uploadFile";

const addProductSchema = z.object({
  name: z.string().min(3),
  type: z.string().min(3),
  price: z.string(),
  code: z.string().min(3),
  attachmentEquip: z.any(),
});

type AddProductData = z.infer<typeof addProductSchema>;

export function AddProduct() {
  const toast = useToast();

  const { handleSubmit, register, reset, setValue } = useForm<AddProductData>({
    defaultValues: {
      name: "",
      type: "",
      price: "",
      code: "",
      attachmentEquip: "",
    },
    shouldUseNativeValidation: true,
    resolver: zodResolver(addProductSchema),
  });

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [image, setImage] = useState<File | null>(null);

  const onFormSubmit = async (data: AddProductData, values: any) => {
    try {
      let filename = " ";

      if (values.attachmentEquip !== undefined) {
        filename = values.attachmentEquip.name;
      }
      addProduct({
        ...values,
        attachmentEquip: filename,
      });

      toast({
        description: "New product created",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      reset();
    } catch (error) {
      if (isAxiosError(error)) {
        let errorDescription = "Error while creating product";

        if (error.response?.status === 409) {
          errorDescription = "Product already exists";
        }

        toast({
          description: errorDescription,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    }
  };

  useEffect(() => {
    register(`attachmentEquip`);
  }, [register]);

  return (
    <div className="h-full flex flex-col items-center ">
      <div className="flex justify-between w-[70%]">
        <form onSubmit={handleSubmit(onFormSubmit)} className="w-full">
          <div className="grid grid-cols-2 grid-flow-row gap-14">
            <div className="mt-3">
              <label>Name *</label>
              <input
                type="text"
                placeholder="Name"
                className="w-full p-3 mt-1 rounded-lg placeholder:text-zinc-400 border-[1px] border-zinc-500"
                {...register("name")}
              />
            </div>

            <div className="mt-3">
              <label>Type *</label>
              <input
                type="text"
                placeholder="Type"
                className="w-full p-3 mt-1 rounded-lg placeholder:text-zinc-400 border-[1px] border-zinc-500"
                {...register("type")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 grid-flow-row gap-14">
            <div className="mt-3">
              <label>Price (US$)*</label>
              <input
                type="number"
                placeholder="Price"
                className="w-full p-3 mt-1 rounded-lg placeholder:text-zinc-400 border-[1px] border-zinc-500"
                {...register("price")}
              />
            </div>

            <div className="mt-3">
              <label>Code *</label>
              <input
                type="code"
                placeholder="Code"
                className="w-full p-3 mt-1 rounded-lg placeholder:text-zinc-400 border-[1px] border-zinc-500"
                {...register("code")}
              />
            </div>
          </div>

          <div className="grid grid-flow-row gap-14">
            <div className="mt-3">
              <label>Image *</label>

              <IndexUploadFile
                onChangeFiles={(file) => setValue(`attachmentEquip`, file)}
              />
            </div>
          </div>

          <div className="w-full flex justify-between items-center">
            <div className="text-xs text-zinc-500">* Required field</div>
            <div className="flex">
              <button
                onClick={() => setIsModalVisible(true)}
                type="button"
                className="bg-red mt-4 rounded-lg p-4 flex items-center font-semibold justify-center hover:opacity-90 transition-all text-white"
              >
                Clear
              </button>
              <button
                type="submit"
                className="bg-black ml-4 mt-4 rounded-lg p-4 flex items-center font-semibold justify-center hover:opacity-90 transition-all text-white"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      </div>

      {isModalVisible ? (
        <NormalModal
          text="Are you sure you want to clear the fields?"
          onCloseModal={() => {
            setIsModalVisible(false);
          }}
          confirmClear={() => {
            setIsModalVisible(false);
            reset();
          }}
        />
      ) : null}
    </div>
  );
}
